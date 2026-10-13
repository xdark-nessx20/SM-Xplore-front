import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { DefList } from '@/components/DefList/DefList'
import type { DefItem } from '@/components/DefList/DefList'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { EVENT_STATUS_LABELS, EVENT_STATUS_TONES } from '@/config/roles'
import { eventsApi } from '@/services/eventsApi'
import {
  combineDateAndTime,
  toDateInput,
  toTimeInput,
} from '@/utils/datetime'
import { describeApiError } from '@/utils/errors'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { EventResponse, EventStatus } from '@/types'
import styles from './events.module.css'

export default function EventManageDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()

  const [event, setEvent] = useState<EventResponse | null>(null)
  const [expected, setExpected] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Edición de los detalles del evento (nombre, categoría, precio, aforo y fechas).
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (eventId === undefined) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const found = await eventsApi.getById(eventId as string)
        if (!cancelled) {
          setEvent(found)
          setExpected(String(found.expectedAttendance))
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
  }, [eventId])

  if (isLoading) {
    return <p className={styles.state}>Cargando evento…</p>
  }

  if (event === null) {
    return (
      <section>
        <Link to="/app/eventos" className={styles.back}>
          ← Volver a gestión de eventos
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró el evento.'}
        </p>
      </section>
    )
  }

  const current = event

  const infoItems: DefItem[] = [
    { label: 'Inicio', value: formatDateTime(current.startsAt) },
    { label: 'Fin', value: formatDateTime(current.endsAt) },
    { label: 'Categoría', value: current.category },
    { label: 'Aforo', value: `${current.maxCapacity} personas` },
    {
      label: 'Afluencia esperada',
      value: `${current.expectedAttendance} personas`,
    },
    {
      label: 'Precio',
      value:
        current.price === 0 ? 'Gratis' : formatCurrency(current.price),
    },
  ]

  async function runAction(
    action: () => Promise<EventResponse>,
    message: string,
  ) {
    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      const updated = await action()
      setEvent(updated)
      setExpected(String(updated.expectedAttendance))
      setFeedback(message)
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  function startEditing() {
    setName(current.name)
    setCategory(current.category)
    setDescription(current.description ?? '')
    setPrice(String(current.price))
    setMaxCapacity(String(current.maxCapacity))
    setDate(toDateInput(current.startsAt))
    setStartTime(toTimeInput(current.startsAt))
    setEndTime(toTimeInput(current.endsAt))
    setIsEditing(true)
    setError(null)
    setFeedback(null)
  }

  async function handleSave(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()

    if (name.trim() === '' || category.trim() === '') {
      setError('El nombre y la categoría son obligatorios.')
      return
    }

    if (date === '' || startTime === '' || endTime === '') {
      setError('Completa la fecha y las horas del evento.')
      return
    }

    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      const updated = await eventsApi.update(current.id, {
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        maxCapacity: Number(maxCapacity),
        startsAt: combineDateAndTime(date, startTime),
        endsAt: combineDateAndTime(date, endTime),
        description:
          description.trim() === '' ? undefined : description.trim(),
      })

      setEvent(updated)
      setExpected(String(updated.expectedAttendance))
      setIsEditing(false)
      setFeedback('Evento actualizado.')
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  const statusActions: Array<{ status: EventStatus; label: string }> = []
  if (current.status === 'DRAFT' || current.status === 'POSTPONED') {
    statusActions.push({ status: 'PUBLISHED', label: 'Publicar' })
  }
  if (current.status === 'PUBLISHED') {
    statusActions.push({ status: 'POSTPONED', label: 'Posponer' })
  }
  if (current.status !== 'CANCELLED') {
    statusActions.push({ status: 'CANCELLED', label: 'Cancelar evento' })
  }

  return (
    <section>
      <Link to="/app/eventos" className={styles.back}>
        ← Volver a gestión de eventos
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Eventos', to: '/app/eventos' },
          { label: current.name },
        ]}
        title={current.name}
        description={`${current.category} · ${formatDateTime(current.startsAt)}`}
        actions={
          <StatusBadge tone={EVENT_STATUS_TONES[current.status]}>
            {EVENT_STATUS_LABELS[current.status]}
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
            <h2 className={styles.cardTitle}>Información del evento</h2>

            {isEditing ? (
              <form
                className={`${styles.grid} ${styles.twoColumns}`}
                onSubmit={handleSave}
                noValidate
              >
                <Field
                  label="Nombre del evento"
                  required
                  value={name}
                  onChange={(changeEvent) => setName(changeEvent.target.value)}
                />
                <Field
                  label="Categoría"
                  required
                  value={category}
                  onChange={(changeEvent) =>
                    setCategory(changeEvent.target.value)
                  }
                />

                <label className={styles.full}>
                  <span className={styles.fieldLabel}>Descripción</span>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(changeEvent) =>
                      setDescription(changeEvent.target.value)
                    }
                  />
                </label>

                <Field
                  label="Precio de entrada (COP)"
                  type="number"
                  min={0}
                  required
                  value={price}
                  onChange={(changeEvent) => setPrice(changeEvent.target.value)}
                />
                <Field
                  label="Aforo / capacidad"
                  type="number"
                  min={1}
                  required
                  value={maxCapacity}
                  onChange={(changeEvent) =>
                    setMaxCapacity(changeEvent.target.value)
                  }
                />

                <Field
                  label="Fecha del evento"
                  type="date"
                  required
                  value={date}
                  onChange={(changeEvent) => setDate(changeEvent.target.value)}
                />
                <div className={`${styles.grid} ${styles.twoColumns}`}>
                  <Field
                    label="Hora inicio"
                    type="time"
                    required
                    value={startTime}
                    onChange={(changeEvent) =>
                      setStartTime(changeEvent.target.value)
                    }
                  />
                  <Field
                    label="Hora fin"
                    type="time"
                    required
                    value={endTime}
                    onChange={(changeEvent) =>
                      setEndTime(changeEvent.target.value)
                    }
                  />
                </div>

                <div className={styles.full}>
                  <p className={styles.helper}>
                    El lugar (atractivo) no se cambia en la edición: se define
                    al crear el evento. El estado y la afluencia se gestionan en
                    sus propias tarjetas.
                  </p>
                </div>

                <div className={`${styles.actions} ${styles.full}`}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isWorking}
                  >
                    {isWorking ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <DefList items={infoItems} />
                {current.description !== null && (
                  <p className={styles.meta}>{current.description}</p>
                )}
                <div className={styles.actions}>
                  <Button variant="outline" onClick={startEditing}>
                    Editar evento
                  </Button>
                </div>
              </>
            )}
          </article>
        </div>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Afluencia esperada</h2>
            <Field
              label="Personas esperadas"
              type="number"
              min={0}
              value={expected}
              onChange={(changeEvent) => setExpected(changeEvent.target.value)}
            />
            <div className={styles.actions}>
              <Button
                variant="accent"
                disabled={isWorking || expected.trim() === ''}
                onClick={() =>
                  void runAction(
                    () =>
                      eventsApi.estimateAttendance(current.id, {
                        expectedAttendance: Number(expected),
                      }),
                    'Afluencia actualizada.',
                  )
                }
              >
                Guardar afluencia
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Estado</h2>
            <div className={styles.actions}>
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  variant={
                    action.status === 'CANCELLED' ? 'outline' : 'primary'
                  }
                  disabled={isWorking}
                  onClick={() =>
                    void runAction(
                      () =>
                        eventsApi.changeStatus(current.id, {
                          status: action.status,
                        }),
                      `Evento en estado ${EVENT_STATUS_LABELS[action.status]}.`,
                    )
                  }
                >
                  {action.label}
                </Button>
              ))}
            </div>
            <p className={styles.helper}>
              Transiciones válidas: borrador → publicado/cancelado; publicado →
              pospuesto/cancelado; pospuesto → publicado/cancelado.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
