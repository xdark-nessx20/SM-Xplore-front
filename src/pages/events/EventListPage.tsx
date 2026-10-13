import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { Pagination } from '@/components/Pagination/Pagination'
import { useAuth } from '@/hooks/useAuth'
import { eventsApi } from '@/services/eventsApi'
import { describeApiError } from '@/utils/errors'
import { formatCurrency } from '@/utils/format'
import type { EventResponse } from '@/types'
import styles from './events.module.css'

const PAGE_SIZE = 6

function dateParts(value: string) {
  const date = new Date(value)
  return {
    day: new Intl.DateTimeFormat('es-CO', { day: 'numeric' }).format(date),
    month: new Intl.DateTimeFormat('es-CO', { month: 'short' })
      .format(date)
      .replace('.', ''),
    time: new Intl.DateTimeFormat('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  }
}

export default function EventListPage() {
  const { user, isAuthenticated } = useAuth()

  const [events, setEvents] = useState<EventResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Filtros aplicados y su borrador (se confirman con "Filtrar")
  const [term, setTerm] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')
  const [draftTerm, setDraftTerm] = useState('')
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')
  const [draftCategory, setDraftCategory] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const all = await eventsApi.list()
        if (!cancelled) {
          setEvents(all.filter((event) => event.status === 'PUBLISHED'))
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setEvents([])
          setError(describeApiError(cause))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category))].sort(),
    [events],
  )

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase()

    return events
      .filter((event) => {
        if (needle !== '' && !event.name.toLowerCase().includes(needle)) {
          return false
        }
        if (category !== '' && event.category !== category) {
          return false
        }
        if (from !== '' && new Date(event.startsAt) < new Date(`${from}T00:00:00`)) {
          return false
        }
        if (to !== '' && new Date(event.startsAt) > new Date(`${to}T23:59:59`)) {
          return false
        }
        return true
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
  }, [events, term, category, from, to])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function applyFilters() {
    setTerm(draftTerm)
    setFrom(draftFrom)
    setTo(draftTo)
    setCategory(draftCategory)
    setPage(1)
  }

  return (
    <div className={styles.page}>
      <PageHeader
        serif
        title="Eventos en Santa Marta"
        meta={`${filtered.length} ${filtered.length === 1 ? 'evento' : 'eventos'}`}
        actions={
          isAuthenticated && user?.role === 'TOURIST' ? (
            <Link to="/eventos/planificados">
              <Button variant="outline">Mis eventos planificados</Button>
            </Link>
          ) : undefined
        }
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.filters}>
        <label className={styles.full}>
          <span className={styles.fieldLabel}>Buscar evento</span>
          <input
            className={styles.control}
            type="search"
            placeholder="Nombre del evento…"
            value={draftTerm}
            onChange={(event) => setDraftTerm(event.target.value)}
          />
        </label>

        <label>
          <span className={styles.fieldLabel}>Zona</span>
          <select className={styles.control} disabled>
            <option>Todas las zonas</option>
          </select>
        </label>
        <label>
          <span className={styles.fieldLabel}>Desde</span>
          <input
            className={styles.control}
            type="date"
            value={draftFrom}
            onChange={(event) => setDraftFrom(event.target.value)}
          />
        </label>
        <label>
          <span className={styles.fieldLabel}>Hasta</span>
          <input
            className={styles.control}
            type="date"
            value={draftTo}
            onChange={(event) => setDraftTo(event.target.value)}
          />
        </label>
        <label>
          <span className={styles.fieldLabel}>Categoría</span>
          <select
            className={styles.control}
            value={draftCategory}
            onChange={(event) => setDraftCategory(event.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <Button variant="accent" size="lg" onClick={applyFilters}>
          Filtrar
        </Button>
      </div>

      {isLoading && <p className={styles.state}>Cargando eventos…</p>}

      {!isLoading && !error && filtered.length === 0 && (
        <p className={styles.state}>
          No hay eventos publicados con estos filtros.
        </p>
      )}

      {visible.length > 0 && (
        <div className={styles.list}>
          {visible.map((event) => {
            const { day, month, time } = dateParts(event.startsAt)
            return (
              <article key={event.id} className={styles.row}>
                <div className={styles.dateBadge}>
                  <span className={styles.dateDay}>{day}</span>
                  <span className={styles.dateMonth}>{month}</span>
                </div>

                <span className={styles.thumb} aria-hidden="true">
                  Sin foto
                </span>

                <div className={styles.body}>
                  <h2 className={styles.title}>{event.name}</h2>
                  <p className={styles.meta}>
                    {event.category} · {time} · aforo {event.maxCapacity}
                  </p>
                </div>

                <div className={styles.side}>
                  <span className={styles.price}>
                    {event.price === 0 ? 'Gratis' : formatCurrency(event.price)}
                  </span>
                  <Link to={`/eventos/${event.id}`}>
                    <Button variant="outline" size="sm">
                      Ver detalle
                    </Button>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <p className={styles.notice}>
        Del diseño faltan: filtro por zona (el backend no expone sitios), la
        miniatura (los eventos no guardan fotos), el lugar y el toggle
        lista/calendario.
      </p>
    </div>
  )
}
