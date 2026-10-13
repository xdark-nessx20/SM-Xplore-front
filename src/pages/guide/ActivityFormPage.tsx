import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { activitiesApi } from '@/services/activitiesApi'
import { combineDateAndTime } from '@/utils/datetime'
import { describeApiError } from '@/utils/errors'
import styles from './guide.module.css'

const LAST_SITE_KEY = 'sm-xplore:last-site-id'

/** El backend guarda una fecha/hora de inicio y otra de fin, no un calendario. */
export default function ActivityFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [siteId, setSiteId] = useState(
    () => window.localStorage.getItem(LAST_SITE_KEY) ?? '',
  )
  const [price, setPrice] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [durationHours, setDurationHours] = useState('4')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('12:00')
  const [publish, setPublish] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (user === null) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      window.localStorage.setItem(LAST_SITE_KEY, siteId.trim())

      const created = await activitiesApi.create({
        siteId: siteId.trim(),
        guideId: user.id,
        name: name.trim(),
        category: category.trim(),
        description: description.trim() === '' ? undefined : description.trim(),
        price: Number(price),
        maxCapacity: Number(maxCapacity),
        durationMinutes: Math.round(Number(durationHours) * 60),
        startsAt: combineDateAndTime(date, startTime),
        endsAt: combineDateAndTime(date, endTime),
      })

      if (publish) {
        await activitiesApi.changeStatus(created.id, { status: 'PUBLISHED' })
      }

      navigate('/app/mis-actividades')
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <Link to="/app/mis-actividades" className={styles.back}>
        ← Volver a mis actividades
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Mis actividades', to: '/app/mis-actividades' },
          { label: 'Nueva actividad' },
        ]}
        title="Registrar nueva actividad"
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.layout}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.cardTitle}>Información de la actividad</h2>

          <div className={`${styles.grid} ${styles.twoColumns}`}>
            <Field
              label="Nombre de la actividad"
              placeholder="Ej: Snorkel en Playa Cristal"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Field
              label="Categoría"
              placeholder="Ej: Aventura"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />

            <label className={styles.full}>
              <span className={styles.summaryValue}>Descripción</span>
              <textarea
                className={styles.textarea}
                placeholder="Describe la experiencia, qué incluye y recomendaciones…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <Field
              label="Atractivo asociado (id del sitio)"
              hint="El backend aún no expone el catálogo de atractivos: pega el UUID del sitio."
              required
              value={siteId}
              onChange={(event) => setSiteId(event.target.value)}
            />
            <Field
              label="Precio por persona (COP)"
              type="number"
              min={0}
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />

            <Field
              label="Duración (horas)"
              type="number"
              min={0.5}
              step={0.5}
              required
              value={durationHours}
              onChange={(event) => setDurationHours(event.target.value)}
            />
            <Field
              label="Capacidad máxima (personas)"
              type="number"
              min={1}
              required
              value={maxCapacity}
              onChange={(event) => setMaxCapacity(event.target.value)}
            />

            <Field
              label="Fecha"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <div className={`${styles.grid} ${styles.twoColumns}`}>
              <Field
                label="Hora inicio"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
              <Field
                label="Hora fin"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="accent" size="lg" type="submit" disabled={isSaving}>
              {isSaving
                ? 'Guardando…'
                : publish
                  ? 'Publicar actividad'
                  : 'Guardar borrador'}
            </Button>
            <Link to="/app/mis-actividades">
              <Button variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>

          <p className={styles.notice}>
            Del diseño faltan por implementar en backend: zona turística,
            punto de encuentro, dificultad, idioma, cupos por turno, días
            disponibles (la API guarda una sola fecha) y fotos.
          </p>
        </form>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Estado</h2>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="estado"
                checked={!publish}
                onChange={() => setPublish(false)}
              />
              Guardar como borrador
            </label>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="estado"
                checked={publish}
                onChange={() => setPublish(true)}
              />
              Publicar al guardar
            </label>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Fotos de la actividad</h2>
            <p className={styles.muted}>
              El backend no permite subir archivos ni guarda fotos de
              actividades: solo acepta URLs, y para servicios.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
