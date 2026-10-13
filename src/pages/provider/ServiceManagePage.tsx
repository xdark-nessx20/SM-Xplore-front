import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { DefList } from '@/components/DefList/DefList'
import type { DefItem } from '@/components/DefList/DefList'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import {
  SERVICE_STATUS_LABELS,
  SERVICE_STATUS_TONES,
  SERVICE_TYPE_LABELS,
} from '@/config/roles'
import { servicesApi } from '@/services/servicesApi'
import { describeApiError } from '@/utils/errors'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { ServiceResponse } from '@/types'
import styles from './provider.module.css'

interface AttributeDraft {
  name: string
  value: string
}

function describeValue(value: unknown): string {
  if (typeof value === 'object' && value !== null && 'name' in value) {
    const nested = value as { name: string; value: unknown }
    return `${nested.name}: ${String(nested.value)}`
  }

  return String(value)
}

export default function ServiceManagePage() {
  const { serviceId } = useParams<{ serviceId: string }>()

  const [service, setService] = useState<ServiceResponse | null>(null)
  const [price, setPrice] = useState('')
  const [photos, setPhotos] = useState('')
  const [attributes, setAttributes] = useState<AttributeDraft[]>([
    { name: '', value: '' },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (serviceId === undefined) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const found = await servicesApi.getById(serviceId as string)
        if (!cancelled) {
          setService(found)
          setPrice(String(found.price))
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
  }, [serviceId])

  if (isLoading) {
    return <p className={styles.state}>Cargando servicio…</p>
  }

  if (service === null) {
    return (
      <section>
        <Link to="/app/mis-servicios" className={styles.back}>
          ← Volver a mis servicios
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró el servicio.'}
        </p>
      </section>
    )
  }

  const current = service

  const infoItems: DefItem[] = [
    { label: 'Tipo', value: SERVICE_TYPE_LABELS[current.type] },
    { label: 'Precio', value: formatCurrency(current.price) },
    {
      label: 'Ubicación',
      value: `${current.location.latitude}, ${current.location.longitude}`,
    },
    { label: 'Creado', value: formatDateTime(current.createdAt) },
    {
      label: 'Atributos',
      value:
        current.extras.length === 0
          ? 'Sin atributos'
          : `${current.extras.length}`,
    },
  ]

  async function runAction(
    action: () => Promise<ServiceResponse>,
    message: string,
  ) {
    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      const updated = await action()
      setService(updated)
      setPrice(String(updated.price))
      setFeedback(message)
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  async function addPhotos() {
    const photosUrls = photos
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '')

    if (photosUrls.length === 0) {
      return
    }

    await runAction(async () => {
      const updated = await servicesApi.addPhotos(current.id, { photosUrls })
      setPhotos('')
      return updated
    }, 'Fotos añadidas.')
  }

  async function addAttributes() {
    const extras = attributes
      .filter((attribute) => attribute.name.trim() !== '')
      .map((attribute) => {
        const trimmed = attribute.value.trim()
        const value =
          trimmed === 'true'
            ? true
            : trimmed === 'false'
              ? false
              : trimmed !== '' && !Number.isNaN(Number(trimmed))
                ? Number(trimmed)
                : trimmed

        return { name: attribute.name.trim(), value }
      })

    if (extras.length === 0) {
      return
    }

    await runAction(async () => {
      const updated = await servicesApi.addAttributes(current.id, {
        attributes: extras,
      })
      setAttributes([{ name: '', value: '' }])
      return updated
    }, 'Atributos añadidos.')
  }

  return (
    <section>
      <Link to="/app/mis-servicios" className={styles.back}>
        ← Volver a mis servicios
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Mis servicios', to: '/app/mis-servicios' },
          { label: current.name },
        ]}
        title={current.name}
        description={`${SERVICE_TYPE_LABELS[current.type]} · ${formatCurrency(current.price)}`}
        actions={
          <StatusBadge tone={SERVICE_STATUS_TONES[current.status]}>
            {SERVICE_STATUS_LABELS[current.status]}
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

      <div className={styles.layout}>
        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Información del servicio</h2>
            <DefList items={infoItems} />

            <h2 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>
              Fotos
            </h2>
            {current.photosUrls.length === 0 ? (
              <p className={styles.meta}>Todavía no hay fotos.</p>
            ) : (
              <ul className={styles.photoList}>
                {current.photosUrls.map((url) => (
                  <li key={url} className={styles.photo}>
                    {url}
                  </li>
                ))}
              </ul>
            )}

            <h2 className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>
              Atributos extra
            </h2>
            {current.extras.length === 0 ? (
              <p className={styles.meta}>Sin atributos todavía.</p>
            ) : (
              <ul className={styles.chipList}>
                {current.extras.map((extra, index) => (
                  <li key={`${extra.name}-${index}`} className={styles.chip}>
                    {extra.name}: {describeValue(extra.value)}
                  </li>
                ))}
              </ul>
            )}

            <p className={styles.notice}>
              El backend no permite cambiar nombre, tipo ni ubicación después de
              crear el servicio, ni quitar fotos o atributos: solo añadirlos.
            </p>
          </article>
        </div>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Precio</h2>
            <Field
              label="Precio por persona (COP)"
              type="number"
              min={0}
              value={price}
              onChange={(changeEvent) => setPrice(changeEvent.target.value)}
            />
            <div className={styles.actions}>
              <Button
                variant="accent"
                disabled={isWorking || price.trim() === ''}
                onClick={() =>
                  void runAction(
                    () =>
                      servicesApi.changePrice(current.id, {
                        price: Number(price),
                      }),
                    'Precio actualizado.',
                  )
                }
              >
                Cambiar precio
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Disponibilidad</h2>
            <div className={styles.actions}>
              <Button
                variant="primary"
                disabled={isWorking || current.status === 'AVAILABLE'}
                onClick={() =>
                  void runAction(
                    () => servicesApi.markAvailable(current.id),
                    'Servicio marcado como disponible.',
                  )
                }
              >
                Marcar disponible
              </Button>
              <Button
                variant="outline"
                disabled={isWorking || current.status === 'UNAVAILABLE'}
                onClick={() =>
                  void runAction(
                    () => servicesApi.markUnavailable(current.id),
                    'Servicio marcado como no disponible.',
                  )
                }
              >
                Marcar no disponible
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Añadir fotos</h2>
            <textarea
              className={styles.textarea}
              placeholder={'https://…/foto-1.jpg\nhttps://…/foto-2.jpg'}
              value={photos}
              onChange={(changeEvent) => setPhotos(changeEvent.target.value)}
            />
            <p className={styles.helper}>Una URL por línea.</p>
            <div className={styles.actions}>
              <Button
                variant="outline"
                disabled={isWorking || photos.trim() === ''}
                onClick={() => void addPhotos()}
              >
                Añadir fotos
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Añadir atributos</h2>
            {attributes.map((attribute, index) => (
              <div key={index} className={styles.row}>
                <Field
                  label="Nombre"
                  value={attribute.name}
                  onChange={(changeEvent) =>
                    setAttributes((items) =>
                      items.map((item, position) =>
                        position === index
                          ? { ...item, name: changeEvent.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <Field
                  label="Valor"
                  value={attribute.value}
                  onChange={(changeEvent) =>
                    setAttributes((items) =>
                      items.map((item, position) =>
                        position === index
                          ? { ...item, value: changeEvent.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <div className={styles.actions}>
              <Button
                variant="outline"
                onClick={() =>
                  setAttributes((items) => [...items, { name: '', value: '' }])
                }
              >
                + Otro atributo
              </Button>
              <Button
                variant="accent"
                disabled={isWorking}
                onClick={() => void addAttributes()}
              >
                Guardar atributos
              </Button>
            </div>
            <p className={styles.helper}>
              Si el atributo ya existe, el backend responde 409.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
