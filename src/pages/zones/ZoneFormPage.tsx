import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { zonesApi } from '@/services/zonesApi'
import { describeApiError } from '@/utils/errors'
import type { SiteRef, Zone, ZoneInput, ZoneStatus } from '@/types'
import styles from './zones.module.css'

/** Wireframe: 11-gestionar-destino-frame · Configurar zona turística. */
export default function ZoneFormPage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()

  const [zone, setZone] = useState<Zone | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState('')
  const [threshold, setThreshold] = useState('')
  const [sites, setSites] = useState<SiteRef[]>([])
  const [newSite, setNewSite] = useState('')
  const [status, setStatus] = useState<ZoneStatus>('NORMAL')
  const [isLoading, setIsLoading] = useState(zoneId !== undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = zoneId === undefined

  useEffect(() => {
    if (zoneId === undefined) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const found = await zonesApi.getById(zoneId as string)
        if (cancelled) return

        setZone(found)
        setName(found.name)
        setDescription(found.description)
        setCapacity(String(found.recommendedCapacity))
        setThreshold(String(found.congestionThreshold))
        setSites(found.sites)
        setStatus(found.status)
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
  }, [zoneId])

  function addSite() {
    const trimmed = newSite.trim()

    if (trimmed === '') {
      return
    }

    setSites((current) => [
      ...current,
      { id: `s-${Date.now()}`, name: trimmed },
    ])
    setNewSite('')
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setIsSaving(true)
    setError(null)

    const input: ZoneInput = {
      name: name.trim(),
      description: description.trim(),
      recommendedCapacity: Number(capacity),
      congestionThreshold: Number(threshold),
      sites,
      boundary: zone?.boundary ?? null,
      status,
    }

    try {
      if (isNew) {
        await zonesApi.create(input)
      } else if (zone !== null) {
        await zonesApi.update(zone.id, input)
      }

      navigate('/app/zonas')
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className={styles.state}>Cargando zona…</p>
  }

  return (
    <section>
      <Link to="/app/zonas" className={styles.back}>
        ← Volver a zonas
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Zonas', to: '/app/zonas' },
          ...(isNew ? [{ label: 'Nueva zona' }] : [{ label: name }]),
        ]}
        title={isNew ? 'Nueva zona turística' : 'Configurar zona turística'}
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.layout}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.cardTitle}>Información de la zona</h2>

          <div className={`${styles.grid} ${styles.twoColumns}`}>
            <Field
              label="Nombre de la zona"
              placeholder="Ej: Centro Histórico"
              required
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
            />

            <label className={`${styles.full}`}>
              <span className={styles.fieldLabel}>Descripción</span>
              <textarea
                className={styles.textarea}
                placeholder="Describe la zona y qué sitios agrupa…"
                value={description}
                onChange={(changeEvent) =>
                  setDescription(changeEvent.target.value)
                }
              />
            </label>

            <Field
              label="Capacidad recomendada (personas)"
              type="number"
              min={1}
              placeholder="1500"
              required
              value={capacity}
              onChange={(changeEvent) => setCapacity(changeEvent.target.value)}
            />
            <Field
              label="Umbral de congestión (%)"
              type="number"
              min={1}
              max={100}
              placeholder="80"
              required
              value={threshold}
              onChange={(changeEvent) => setThreshold(changeEvent.target.value)}
            />

            <div className={styles.full}>
              <span className={styles.fieldLabel}>Sitios incluidos</span>

              <ul className={styles.chips}>
                {sites.map((site) => (
                  <li key={site.id} className={styles.chip}>
                    {site.name}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() =>
                        setSites((current) =>
                          current.filter((item) => item.id !== site.id),
                        )
                      }
                      aria-label={`Quitar ${site.name}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {sites.length === 0 && (
                  <li className={styles.helper}>Todavía no agrupa sitios.</li>
                )}
              </ul>

              <div className={styles.actions} style={{ marginTop: '0.75rem' }}>
                <input
                  className={styles.control}
                  placeholder="Nombre del sitio o atractivo"
                  value={newSite}
                  onChange={(changeEvent) => setNewSite(changeEvent.target.value)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === 'Enter') {
                      keyEvent.preventDefault()
                      addSite()
                    }
                  }}
                />
                <Button variant="outline" onClick={addSite}>
                  + Añadir sitio
                </Button>
              </div>
              <p className={styles.helper}>
                El catálogo de sitios todavía no existe en el backend: aquí se
                agregan por nombre.
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="lg" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
            <Link to="/app/zonas">
              <Button variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Delimitación en el mapa</h2>
            <div className={styles.map}>
              {zone?.boundary === null || zone === null
                ? 'Sin delimitar'
                : 'Delimitación guardada'}
              <br />
              (pendiente: el backend no guarda polígonos y no hay servicio de
              mapas)
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Estado de la zona</h2>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="estado-zona"
                checked={status === 'NORMAL'}
                onChange={() => setStatus('NORMAL')}
              />
              Normal
            </label>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="estado-zona"
                checked={status === 'CONGESTED'}
                onChange={() => setStatus('CONGESTED')}
              />
              Congestionada
            </label>
            <p className={styles.helper}>
              Al marcarla como congestionada se avisará a los turistas y se
              sugerirán zonas alternativas.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
