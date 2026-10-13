import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { DataTable } from '@/components/DataTable/DataTable'
import type { Column } from '@/components/DataTable/DataTable'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { SearchInput } from '@/components/SearchInput/SearchInput'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { zonesApi } from '@/services/zonesApi'
import { describeApiError } from '@/utils/errors'
import type { Zone, ZoneStatus } from '@/types'
import styles from './zones.module.css'
import tableStyles from '@/pages/admin/admin.module.css'

const FILTERS: Array<{ label: string; status?: ZoneStatus }> = [
  { label: 'Todas' },
  { label: 'Normal', status: 'NORMAL' },
  { label: 'Congestionada', status: 'CONGESTED' },
]

/** Wireframe: 11-gestionar-destino-frame-115-1326 · Zonas turísticas (listado). */
export default function ZonesListPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterIndex, setFilterIndex] = useState(0)
  const [term, setTerm] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const found = await zonesApi.list()
        if (!cancelled) {
          setZones(found)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) setError(describeApiError(cause))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const status = FILTERS[filterIndex]?.status
    const needle = term.trim().toLowerCase()

    return zones.filter((zone) => {
      if (status !== undefined && zone.status !== status) {
        return false
      }

      return needle === '' || zone.name.toLowerCase().includes(needle)
    })
  }, [zones, filterIndex, term])

  const columns: Column<Zone>[] = [
    {
      header: 'Zona',
      render: (zone) => (
        <div>
          <p className={tableStyles.userName}>{zone.name}</p>
          <p className={tableStyles.userEmail}>
            {zone.sites.length}{' '}
            {zone.sites.length === 1 ? 'sitio' : 'sitios'}
          </p>
        </div>
      ),
    },
    {
      header: 'Atractivos',
      render: (zone) => zone.sites.length,
    },
    {
      header: 'Afluencia actual',
      render: (zone) => (
        <div className={styles.occupancy}>
          <span className={styles.occupancyValue}>{zone.currentOccupancy}%</span>
          <span className={styles.bar}>
            <span
              className={`${styles.barFill} ${
                zone.status === 'CONGESTED' ? styles.barFillAlert : ''
              }`}
              style={{ width: `${zone.currentOccupancy}%` }}
            />
          </span>
        </div>
      ),
    },
    {
      header: 'Estado',
      render: (zone) => (
        <StatusBadge tone={zone.status === 'CONGESTED' ? 'danger' : 'success'}>
          {zone.status === 'CONGESTED' ? 'Congestionada' : 'Normal'}
        </StatusBadge>
      ),
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (zone) => (
        <Link to={`/app/zonas/${zone.id}`}>
          <Button variant="outline" size="sm">
            Configurar
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        breadcrumb={[{ label: 'Zonas' }, { label: 'Listado' }]}
        title="Zonas turísticas"
        description="Una zona agrupa varios sitios o atractivos. Zona ≠ sitio."
        actions={
          <div className={tableStyles.search}>
            <SearchInput
              label="Buscar zona por nombre"
              placeholder="Buscar zona por nombre…"
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

      <div className={tableStyles.chips}>
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
        rowKey={(zone) => zone.id}
        isLoading={isLoading}
        loadingMessage="Cargando zonas…"
        emptyMessage="No hay zonas con estos filtros."
      />

      <div className={styles.actions}>
        <Link to="/app/zonas/nueva">
          <Button variant="primary">+ Nueva zona</Button>
        </Link>
      </div>

      <p className={styles.notice}>
        Vista diseñada según el wireframe y funcionando con datos de ejemplo: el
        backend no tiene todavía API de zonas ni de sitios. La capa de datos está
        aislada en <code>src/services/zonesApi.ts</code> y el % de afluencia
        necesita una fuente de ocupación que aún no existe.
      </p>
    </section>
  )
}
