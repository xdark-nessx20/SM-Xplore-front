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
import { activitiesApi } from '@/services/activitiesApi'
import { loadCatalogLookup } from '@/services/catalogLookup'
import type { CatalogEntry } from '@/services/catalogLookup'
import { reservationsApi } from '@/services/reservationsApi'
import { servicesApi } from '@/services/servicesApi'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import type {
  ReservationItemResponse,
  ReservationResponse,
  ReservationStatus,
} from '@/types'
import tableStyles from '@/pages/admin/admin.module.css'
import styles from '@/pages/reservations/reservations.module.css'

/** El backend no tiene endpoint por prestadora: se piden todos los estados. */
const ALL_STATUSES: ReservationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLATION_REQUESTED',
  'REJECTED',
  'CANCELLED',
  'NO_SHOW',
  'COMPLETED',
]

const MAX_CANDIDATES = 60

const FILTERS: Array<{ label: string; statuses?: ReservationStatus[] }> = [
  { label: 'Todas' },
  { label: 'Pendientes', statuses: ['PENDING'] },
  { label: 'Confirmadas', statuses: ['CONFIRMED', 'COMPLETED'] },
  { label: 'Rechazadas', statuses: ['REJECTED', 'CANCELLED'] },
]

interface Row {
  reservation: ReservationResponse
  item: ReservationItemResponse | undefined
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

  const providerId = user?.id
  const role = user?.role

  async function load() {
    if (providerId === undefined || role === undefined) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Ítems propios: actividades del guía o servicios de la prestadora.
      const myItemIds = new Set<string>()

      if (role === 'GUIDE') {
        const activities = await activitiesApi.list()
        for (const activity of activities) {
          if (activity.guideId === providerId) {
            myItemIds.add(activity.id)
          }
        }
      } else if (role === 'SERVICE_PROVIDER') {
        const services = await servicesApi.listByProvider(providerId)
        for (const service of services) {
          myItemIds.add(service.id)
        }
      }

      // 2. Reservas de todos los estados.
      const reservationResults = await Promise.allSettled(
        ALL_STATUSES.map((status) =>
          reservationsApi.list({ status, limit: 200 }),
        ),
      )

      const byId = new Map<string, ReservationResponse>()
      for (const result of reservationResults) {
        if (result.status === 'fulfilled') {
          for (const reservation of result.value) {
            byId.set(reservation.id, reservation)
          }
        }
      }

      const candidates = [...byId.values()]
        .sort(
          (a, b) =>
            new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
        )
        .slice(0, MAX_CANDIDATES)

      // 3. Solo las que tienen algún ítem mío.
      const itemResults = await Promise.allSettled(
        candidates.map((reservation) =>
          reservationsApi.listItems(reservation.id),
        ),
      )

      const mine: Array<{ reservation: ReservationResponse; item: ReservationItemResponse }> = []

      itemResults.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return
        }

        const owned = result.value.filter((item) => myItemIds.has(item.itemId))
        if (owned.length > 0) {
          mine.push({ reservation: candidates[index], item: owned[0] })
        }
      })

      // 4. Turistas y nombres de los ítems.
      const touristIds = [...new Set(mine.map(({ reservation }) => reservation.touristId))]
      const [touristResults, catalog] = await Promise.all([
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
        mine.map(({ reservation, item }) => ({
          reservation,
          item,
          entry: catalog.get(item.itemId),
          touristName: names.get(reservation.touristId) ?? 'Turista',
        })),
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
  }, [providerId, role])

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
        row.reservation.id.toLowerCase().includes(needle)
      )
    })
  }, [rows, filterIndex, term])

  function actionFor(row: Row) {
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

    if (row.reservation.status === 'CONFIRMED') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={workingId === row.reservation.id}
          onClick={() =>
            void runAction(row.reservation.id, reservationsApi.cancel)
          }
        >
          Cancelar
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
            #{row.reservation.id.slice(0, 8).toUpperCase()}
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
        loadingMessage="Buscando reservas de tus ítems…"
        emptyMessage="No tienes reservas recibidas con estos filtros."
      />

      <p className={styles.notice}>
        El backend no expone reservas por prestadora: aquí se muestran las que
        contienen ítems tuyos.{' '}
        <Link to="/app/mis-servicios">Ver mis ítems</Link>
      </p>
    </section>
  )
}
