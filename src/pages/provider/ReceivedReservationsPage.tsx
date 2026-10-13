import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { DataTable } from '@/components/DataTable/DataTable'
import type { Column } from '@/components/DataTable/DataTable'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { SearchInput } from '@/components/SearchInput/SearchInput'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
} from '@/config/roles'
import { useAuth } from '@/hooks/useAuth'
import { loadCatalogLookup } from '@/services/catalogLookup'
import type { CatalogEntry } from '@/services/catalogLookup'
import { reservationsApi } from '@/services/reservationsApi'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import type { ReservationResponse, ReservationStatus } from '@/types'
import tableStyles from '@/pages/admin/admin.module.css'
import styles from '@/pages/reservations/reservations.module.css'

const FILTERS: Array<{ label: string; statuses?: ReservationStatus[] }> = [
  { label: 'Todas' },
  { label: 'Pendientes', statuses: ['PENDING'] },
  { label: 'Confirmadas', statuses: ['CONFIRMED', 'COMPLETED'] },
  { label: 'Rechazadas', statuses: ['REJECTED', 'CANCELLED'] },
]

interface Row {
  reservation: ReservationResponse
  entry: CatalogEntry | undefined
  touristName: string
}

export default function ReceivedReservationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [filterIndex, setFilterIndex] = useState(0)
  const [term, setTerm] = useState('')

  const userId = user?.id
  const role = user?.role

  async function load() {
    if (userId === undefined || role === undefined) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Reservas recibidas: una sola consulta por cuenta (prestadora o guía).
      const received =
        role === 'GUIDE'
          ? await reservationsApi.listByGuide(userId, { limit: 200 })
          : await reservationsApi.listByProvider(userId, { limit: 200 })

      const sorted = [...received].sort(
        (a, b) =>
          new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
      )

      // Primer ítem de cada reserva (para mostrar el nombre del servicio/actividad)
      // y nombre del turista. Ambas consultas van en paralelo.
      const touristIds = [
        ...new Set(sorted.map((reservation) => reservation.touristId)),
      ]

      const [itemResults, touristResults, catalog] = await Promise.all([
        Promise.allSettled(
          sorted.map((reservation) =>
            reservationsApi.listItems(reservation.id),
          ),
        ),
        Promise.allSettled(touristIds.map((id) => usersApi.getById(id))),
        loadCatalogLookup(),
      ])

      const names = new Map<string, string>()
      touristResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          names.set(touristIds[index], result.value.fullName)
        }
      })

      setRows(
        sorted.map((reservation, index) => {
          const itemResult = itemResults[index]
          const item =
            itemResult?.status === 'fulfilled'
              ? itemResult.value[0]
              : undefined

          return {
            reservation,
            entry: item !== undefined ? catalog.get(item.itemId) : undefined,
            touristName: names.get(reservation.touristId) ?? 'Turista',
          }
        }),
      )
    } catch (cause) {
      setRows([])
      setError(describeApiError(cause))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role])

  async function runAction(
    reservationId: string,
    action: (id: string) => Promise<ReservationResponse>,
  ) {
    setWorkingId(reservationId)
    setError(null)

    try {
      const updated = await action(reservationId)
      setRows((current) =>
        current.map((row) =>
          row.reservation.id === reservationId
            ? { ...row, reservation: updated }
            : row,
        ),
      )
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setWorkingId(null)
    }
  }

  const filtered = useMemo(() => {
    const statuses = FILTERS[filterIndex]?.statuses
    const needle = term.trim().toLowerCase()

    return rows.filter((row) => {
      if (statuses !== undefined && !statuses.includes(row.reservation.status)) {
        return false
      }

      if (needle === '') {
        return true
      }

      return (
        row.touristName.toLowerCase().includes(needle) ||
        row.reservation.code.toLowerCase().includes(needle)
      )
    })
  }, [rows, filterIndex, term])

  function actionFor(row: Row) {
    // Confirmar/rechazar/asistencia/no-show los puede hacer la prestadora o el
    // guía de la reserva; cancelar queda reservado al turista dueño o a staff.
    if (row.reservation.status === 'PENDING') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={workingId === row.reservation.id}
          onClick={() =>
            void runAction(row.reservation.id, reservationsApi.confirm)
          }
        >
          Confirmar
        </Button>
      )
    }

    return null
  }

  const columns: Column<Row>[] = [
    {
      header: 'Reserva',
      render: (row) => (
        <div>
          <p className={tableStyles.userName}>
            {row.entry?.name ?? 'Ítem reservado'}
          </p>
          <p className={tableStyles.userEmail}>
            #{row.reservation.code}
          </p>
        </div>
      ),
    },
    {
      header: 'Turista',
      render: (row) => row.touristName,
    },
    {
      header: 'Fecha',
      render: (row) => formatDate(row.reservation.bookedFor),
    },
    {
      header: 'Personas',
      render: (row) => row.reservation.numberOfPeople,
    },
    {
      header: 'Estado',
      render: (row) => (
        <StatusBadge tone={RESERVATION_STATUS_TONES[row.reservation.status]}>
          {RESERVATION_STATUS_LABELS[row.reservation.status]}
        </StatusBadge>
      ),
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <div className={tableStyles.form}>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/app/reservas-recibidas/${row.reservation.id}`)
            }
          >
            Ver
          </Button>
          {actionFor(row)}
        </div>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        breadcrumb={[{ label: 'Reservas' }, { label: 'Recibidas' }]}
        title="Reservas recibidas"
        actions={
          <div className={tableStyles.search}>
            <SearchInput
              label="Buscar por turista o código"
              placeholder="Buscar por turista o código…"
              value={term}
              onChange={setTerm}
            />
          </div>
        }
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.filters}>
        {FILTERS.map((filter, index) => (
          <Chip
            key={filter.label}
            selected={filterIndex === index}
            onClick={() => setFilterIndex(index)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.reservation.id}
        isLoading={isLoading}
        loadingMessage="Cargando reservas recibidas…"
        emptyMessage="No tienes reservas recibidas con estos filtros."
      />

      <p className={styles.notice}>
        Datos reales de <code>/reservations/providers|guides/{'{id}'}</code>.
        El diseño muestra «Cancelar» en las confirmadas, pero la API solo permite
        cancelar al turista dueño o a un admin/gestora: aquí la prestadora y el
        guía confirman, rechazan y registran asistencia o no-show.{' '}
        <Link
          to={role === 'GUIDE' ? '/app/mis-actividades' : '/app/mis-servicios'}
        >
          {role === 'GUIDE' ? 'Ver mis actividades' : 'Ver mis servicios'}
        </Link>
      </p>
    </section>
  )
}
