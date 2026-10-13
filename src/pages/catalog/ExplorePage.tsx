import { useEffect, useMemo, useState } from 'react'
import { ActivityCard } from '@/components/ActivityCard/ActivityCard'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { Pagination } from '@/components/Pagination/Pagination'
import { activitiesApi } from '@/services/activitiesApi'
import { describeApiError } from '@/utils/errors'
import type { ActivityResponse } from '@/types'
import styles from './catalog.module.css'

const PAGE_SIZE = 12
const PRICE_STEP = 10000

type SortOrder = 'relevance' | 'priceAsc' | 'priceDesc' | 'durationAsc'

export default function ExplorePage() {
  const [activities, setActivities] = useState<ActivityResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros aplicados
  const [categories, setCategories] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [fromDate, setFromDate] = useState('')

  // Borrador: se confirma con "Aplicar", como en el mockup
  const [draftCategories, setDraftCategories] = useState<string[]>([])
  const [draftMaxPrice, setDraftMaxPrice] = useState<number | null>(null)
  const [draftFromDate, setDraftFromDate] = useState('')

  const [sort, setSort] = useState<SortOrder>('relevance')
  const [page, setPage] = useState(1)
  /** Cambia de valor para forzar una recarga (botón "Reintentar"). */
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const all = await activitiesApi.list()
        if (!cancelled) {
          // El catálogo público muestra solo actividades publicadas.
          setActivities(
            all.filter((activity) => activity.status === 'PUBLISHED'),
          )
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setActivities([])
          setError(describeApiError(cause))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  function retry() {
    setIsLoading(true)
    setError(null)
    setReloadToken((current) => current + 1)
  }

  const availableCategories = useMemo(
    () => [...new Set(activities.map((activity) => activity.category))].sort(),
    [activities],
  )

  const priceCeiling = useMemo(
    () =>
      Math.max(
        PRICE_STEP,
        ...activities.map((activity) => activity.price),
      ),
    [activities],
  )

  const filtered = useMemo(() => {
    const list = activities.filter((activity) => {
      if (
        categories.length > 0 &&
        !categories.includes(activity.category)
      ) {
        return false
      }

      if (maxPrice !== null && activity.price > maxPrice) {
        return false
      }

      if (
        fromDate !== '' &&
        new Date(activity.startsAt) < new Date(`${fromDate}T00:00:00`)
      ) {
        return false
      }

      return true
    })

    switch (sort) {
      case 'priceAsc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'priceDesc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'durationAsc':
        return [...list].sort((a, b) => a.durationMinutes - b.durationMinutes)
      default:
        return list
    }
  }, [activities, categories, maxPrice, fromDate, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleDraftCategory(category: string) {
    setDraftCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  function applyFilters() {
    setCategories(draftCategories)
    setMaxPrice(draftMaxPrice)
    setFromDate(draftFromDate)
    setPage(1)
  }

  function clearFilters() {
    setDraftCategories([])
    setDraftMaxPrice(null)
    setDraftFromDate('')
    setCategories([])
    setMaxPrice(null)
    setFromDate('')
    setPage(1)
  }

  const hasActiveFilters =
    categories.length > 0 || maxPrice !== null || fromDate !== ''

  return (
    <div className={styles.page}>
      <PageHeader
        serif
        title="Actividades turísticas en Santa Marta"
        meta={`${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`}
        actions={
          <select
            className={styles.sort}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortOrder)
              setPage(1)
            }}
            aria-label="Ordenar resultados"
          >
            <option value="relevance">Ordenar: por relevancia</option>
            <option value="priceAsc">Ordenar: precio (menor a mayor)</option>
            <option value="priceDesc">Ordenar: precio (mayor a menor)</option>
            <option value="durationAsc">Ordenar: duración (menor a mayor)</option>
          </select>
        }
      />

      {error !== null && (
        <p className={`${styles.banner} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <h2 className={styles.filtersTitle}>Filtros</h2>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Zona</span>
            <select className={styles.control} disabled>
              <option>Todas las zonas</option>
            </select>
          </label>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Categoría</span>
            <div className={styles.chips}>
              {availableCategories.length === 0 && (
                <span className={styles.paragraphMuted}>—</span>
              )}
              {availableCategories.map((category) => (
                <Chip
                  key={category}
                  accent
                  selected={draftCategories.includes(category)}
                  onClick={() => toggleDraftCategory(category)}
                >
                  {category}
                </Chip>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Atractivo</span>
            <select className={styles.control} disabled>
              <option>Todos los atractivos</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Fecha</span>
            <input
              className={styles.control}
              type="date"
              value={draftFromDate}
              onChange={(event) => setDraftFromDate(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Precio hasta{' '}
              {draftMaxPrice === null
                ? 'cualquiera'
                : `$${draftMaxPrice.toLocaleString('es-CO')}`}
            </span>
            <input
              className={styles.range}
              type="range"
              min={0}
              max={priceCeiling}
              step={PRICE_STEP}
              value={draftMaxPrice ?? priceCeiling}
              onChange={(event) => setDraftMaxPrice(Number(event.target.value))}
            />
          </label>

          <div className={styles.filterActions}>
            <Button variant="accent" onClick={applyFilters}>
              Aplicar
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </aside>

        <section>
          {isLoading && (
            <p className={styles.state}>Cargando actividades…</p>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className={styles.state}>
              <p className={styles.stateTitle}>
                {hasActiveFilters
                  ? 'No encontramos actividades con esos filtros'
                  : 'Todavía no hay actividades publicadas'}
              </p>
              <p>
                {hasActiveFilters
                  ? 'Prueba con otra categoría, una fecha anterior o un precio mayor.'
                  : 'Cuando las gestoras publiquen actividades aparecerán aquí.'}
              </p>
              {hasActiveFilters && (
                <div className={styles.stateActions}>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {!isLoading && error !== null && (
            <div className={styles.stateActions}>
              <Button variant="accent" onClick={retry}>
                Reintentar
              </Button>
            </div>
          )}

          {visible.length > 0 && (
            <div className={styles.cards}>
              {visible.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      </div>
    </div>
  )
}
