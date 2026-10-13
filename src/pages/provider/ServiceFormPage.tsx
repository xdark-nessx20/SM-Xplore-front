import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { SERVICE_TYPE_LABELS } from '@/config/roles'
import { useAuth } from '@/hooks/useAuth'
import { servicesApi } from '@/services/servicesApi'
import { describeApiError } from '@/utils/errors'
import type { AttributeDto, ServiceType } from '@/types'
import styles from './provider.module.css'

interface AttributeDraft {
  name: string
  value: string
}

const TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
)

/** Interpreta el valor escrito: número, booleano o texto. */
function toAttributeValue(value: string): string | number | boolean {
  const trimmed = value.trim()

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed)

  return trimmed
}

export default function ServiceFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [type, setType] = useState<ServiceType>('LODGING')
  const [price, setPrice] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [photos, setPhotos] = useState('')
  const [attributes, setAttributes] = useState<AttributeDraft[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateAttribute(index: number, patch: Partial<AttributeDraft>) {
    setAttributes((current) =>
      current.map((attribute, position) =>
        position === index ? { ...attribute, ...patch } : attribute,
      ),
    )
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()

    if (user === null) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const extras: AttributeDto[] = attributes
        .filter((attribute) => attribute.name.trim() !== '')
        .map((attribute) => ({
          name: attribute.name.trim(),
          value: toAttributeValue(attribute.value),
        }))

      const photosUrls = photos
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url !== '')

      await servicesApi.create({
        provider: { id: user.id, name: user.fullName },
        name: name.trim(),
        type,
        price: Number(price),
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        photosUrls: photosUrls.length > 0 ? photosUrls : undefined,
        extras: extras.length > 0 ? extras : undefined,
      })

      navigate('/app/mis-servicios')
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <Link to="/app/mis-servicios" className={styles.back}>
        ← Volver a mis servicios
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Mis servicios', to: '/app/mis-servicios' },
          { label: 'Nuevo servicio' },
        ]}
        title="Registrar servicio"
        description="El servicio queda disponible para el catálogo apenas se crea."
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.layout}>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.cardTitle}>Información del servicio</h2>

          <div className={`${styles.grid} ${styles.twoColumns}`}>
            <Field
              label="Nombre del servicio"
              placeholder="Ej: Alquiler de kayak"
              required
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
            />

            <label>
              <span className={styles.names}>Tipo de servicio</span>
              <select
                className={styles.textarea}
                style={{ minHeight: 'auto' }}
                value={type}
                onChange={(changeEvent) =>
                  setType(changeEvent.target.value as ServiceType)
                }
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Precio por persona (COP)"
              type="number"
              min={0}
              required
              value={price}
              onChange={(changeEvent) => setPrice(changeEvent.target.value)}
            />
            <div className={`${styles.grid} ${styles.twoColumns}`}>
              <Field
                label="Latitud"
                inputMode="decimal"
                placeholder="11.2404"
                required
                value={latitude}
                onChange={(changeEvent) => setLatitude(changeEvent.target.value)}
              />
              <Field
                label="Longitud"
                inputMode="decimal"
                placeholder="-74.1990"
                required
                value={longitude}
                onChange={(changeEvent) =>
                  setLongitude(changeEvent.target.value)
                }
              />
            </div>

            <label className={styles.full}>
              <span className={styles.names}>Fotos (una URL por línea)</span>
              <textarea
                className={styles.textarea}
                placeholder={'https://…/foto-1.jpg\nhttps://…/foto-2.jpg'}
                value={photos}
                onChange={(changeEvent) => setPhotos(changeEvent.target.value)}
              />
              <span className={styles.helper}>
                El backend no sube archivos: solo guarda URLs.
              </span>
            </label>
          </div>

          <h2 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>
            Atributos extra
          </h2>

          {attributes.length === 0 && (
            <p className={styles.meta}>
              Sin atributos. Ejemplos: “Incluye equipo” = true, “Capacidad” = 8.
            </p>
          )}

          {attributes.map((attribute, index) => (
            <div key={index} className={styles.row}>
              <Field
                label="Nombre"
                placeholder="Incluye equipo"
                value={attribute.name}
                onChange={(changeEvent) =>
                  updateAttribute(index, { name: changeEvent.target.value })
                }
              />
              <Field
                label="Valor"
                placeholder="true"
                value={attribute.value}
                onChange={(changeEvent) =>
                  updateAttribute(index, { value: changeEvent.target.value })
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAttributes((current) =>
                    current.filter((_, position) => position !== index),
                  )
                }
              >
                Quitar
              </Button>
            </div>
          ))}

          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={() =>
                setAttributes((current) => [...current, { name: '', value: '' }])
              }
            >
              + Agregar atributo
            </Button>
          </div>

          <div className={styles.actions}>
            <Button variant="accent" size="lg" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Crear servicio'}
            </Button>
            <Link to="/app/mis-servicios">
              <Button variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Cómo funciona</h2>
            <p className={styles.meta}>
              El servicio nace **Disponible**. Después puedes cambiar el precio,
              añadir fotos y atributos, o marcarlo como no disponible desde
              "Gestionar".
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
