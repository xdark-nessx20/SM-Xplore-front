import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar/Avatar'
import { Button } from '@/components/Button'
import { DefList } from '@/components/DefList/DefList'
import type { DefItem } from '@/components/DefList/DefList'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import {
  PAYMENT_METHOD_LABELS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONES,
  ROLE_LABELS,
} from '@/config/roles'
import { itemLabel, loadCatalogLookup } from '@/services/catalogLookup'
import type { CatalogEntry } from '@/services/catalogLookup'
import { reservationsApi } from '@/services/reservationsApi'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatCurrency, formatDate } from '@/utils/format'
import type {
  ReservationItemResponse,
  ReservationResponse,
  UserRole,
} from '@/types'
import styles from './reservations.module.css'

interface ContactInfo {
  name: string
  role: UserRole
  /** El backend lo entrega solo con sesión iniciada. */
  email: string | null
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function ReservationDetailPage() {
  const { reservationId } = useParams<{ reservationId: string }>()

  const [reservation, setReservation] = useState<ReservationResponse | null>(
    null,
  )
  const [items, setItems] = useState<ReservationItemResponse[]>([])
  const [lookup, setLookup] = useState<Map<string, CatalogEntry>>(new Map())
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (reservationId === undefined) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const [found, foundItems, catalog] = await Promise.all([
          reservationsApi.getById(reservationId as string),
          reservationsApi.listItems(reservationId as string),
          loadCatalogLookup(),
        ])

        if (cancelled) return

        setReservation(found)
        setItems(foundItems)
        setLookup(catalog)
        setError(null)

        // Quién presta el servicio: guía de la actividad o prestadora del servicio.
        const first = foundItems[0]
        const entry = first !== undefined ? catalog.get(first.itemId) : undefined

        if (entry !== undefined && entry.providerId !== undefined) {
          try {
            if (entry.type === 'ACTIVITY') {
              const guide = await usersApi.getGuideProfile(entry.providerId)
              if (!cancelled) {
                setContact({
                  name: guide.fullName,
                  role: 'GUIDE',
                  email: guide.email,
                })
              }
            } else if (entry.type === 'SERVICE') {
              const provider = await usersApi.getProviderProfile(
                entry.providerId,
              )
              if (!cancelled) {
                setContact({
                  name: provider.fullName,
                  role: 'SERVICE_PROVIDER',
                  email: provider.email,
                })
              }
            }
          } catch {
            // Si no se puede resolver el contacto, la tarjeta no se muestra.
          }
        }
      } catch (cause) {
        if (!cancelled) {
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
  }, [reservationId])

  if (isLoading) {
    return <p className={styles.page}>Cargando reserva…</p>
  }

  if (reservation === null) {
    return (
      <div className={styles.page}>
        <Link to="/mis-reservas" className={styles.back}>
          ← Volver a mis reservas
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró la reserva.'}
        </p>
      </div>
    )
  }

  const first = items[0]
  const entry = first !== undefined ? lookup.get(first.itemId) : undefined
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const code = reservation.code
  const canRequestCancellation =
    reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'

  const infoItems: DefItem[] = [
    {
      label: 'Fecha y hora',
      value: `${formatDate(reservation.bookedFor)} · ${formatTime(reservation.bookedFor)}`,
    },
    { label: 'Personas', value: String(reservation.numberOfPeople) },
    { label: 'Método de pago', value: PAYMENT_METHOD_LABELS[reservation.paymentMethod] },
    { label: 'Punto de encuentro', value: '—' },
    { label: 'Itinerario', value: '—' },
    { label: 'Notas', value: reservation.notes ?? 'Sin notas' },
  ]

  async function handleRequestCancellation() {
    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      const updated = await reservationsApi.requestCancellation(
        reservation!.id,
      )
      setReservation(updated)
      setFeedback(
        'Solicitud de cancelación enviada. La prestadora o el guía la revisarán.',
      )
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/mis-reservas" className={styles.back}>
        ← Volver a mis reservas
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Inicio', to: '/explorar' },
          { label: 'Mis reservas', to: '/mis-reservas' },
          { label: `#${code}` },
        ]}
        title={`Reserva ${code}`}
        description={`Creada el ${formatDate(reservation.bookedAt)}`}
        actions={
          <StatusBadge tone={RESERVATION_STATUS_TONES[reservation.status]}>
            {RESERVATION_STATUS_LABELS[reservation.status]}
          </StatusBadge>
        }
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      {feedback !== null && (
        <p className={`${styles.feedback} ${styles.success}`}>{feedback}</p>
      )}

      <div className={styles.detailLayout}>
        <div className={styles.column}>
          <article className={styles.card}>
            <div className={styles.itemRow}>
              <span className={styles.itemThumb} aria-hidden="true">
                Sin foto
              </span>
              <div>
                <h2 className={styles.itemName}>
                  {entry?.name ?? 'Ítem reservado'}
                </h2>
                <p className={styles.itemMeta}>
                  {itemLabel(entry?.type ?? first?.type ?? 'ACTIVITY')}
                  {contact !== null &&
                    ` · ${ROLE_LABELS[contact.role]}: ${contact.name}`}
                </p>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Información de la reserva</h2>
            <DefList items={infoItems} />
            <p className={styles.notice}>
              "Punto de encuentro" e "Itinerario" aparecen vacíos porque el
              backend todavía no los almacena.
            </p>
          </article>

          {contact !== null && (
            <article className={styles.card}>
              <h2 className={styles.cardTitle}>Prestador</h2>
              <div className={styles.contact}>
                <Avatar name={contact.name} />
                <div>
                  <p className={styles.contactName}>{contact.name}</p>
                  <p className={styles.contactMeta}>
                    {ROLE_LABELS[contact.role]} ·{' '}
                    {contact.email ?? 'Correo no disponible'}
                  </p>
                </div>
              </div>
            </article>
          )}
        </div>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Pago y acciones</h2>

            <div className={styles.lines}>
              <div className={styles.line}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.line}>
                <span>Cargo de servicio</span>
                <span>—</span>
              </div>
              <div className={styles.totalLine}>
                <span>Total</span>
                <span>{formatCurrency(reservation.total)}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" disabled>
                Modificar reserva
              </Button>
              <Button
                variant="outline"
                disabled={!canRequestCancellation || isWorking}
                onClick={() => void handleRequestCancellation()}
              >
                {isWorking ? 'Enviando…' : 'Cancelar reserva'}
              </Button>
              <p className={styles.actionsNote}>
                {canRequestCancellation
                  ? 'La prestadora o el guía confirman o rechazan desde su panel.'
                  : 'Con el estado actual ya no se puede cancelar.'}
              </p>
              <p className={styles.actionsNote}>
                "Modificar reserva" estará disponible cuando el backend exponga
                el cambio de ítems y fechas.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
