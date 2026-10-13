import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import {
  REGISTRATION_LABELS,
  REGISTRATION_TONES,
  STATUS_LABELS,
} from '@/config/roles'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import type { ServiceProviderProfileResponse } from '@/types'
import styles from './admin.module.css'

/** Documentos que el diseño pide validar; el backend aún no los almacena. */
const REQUIRED_DOCUMENTS = [
  'Cámara de comercio',
  'RUT',
  'Certificado de seguridad',
]

export default function ProviderApprovalPage() {
  const { providerId } = useParams<{ providerId: string }>()

  const [provider, setProvider] =
    useState<ServiceProviderProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (providerId === undefined) {
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const found = await usersApi.getProviderProfile(providerId as string)
        if (!cancelled) {
          setProvider(found)
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

    void load()

    return () => {
      cancelled = true
    }
  }, [providerId])

  if (isLoading) {
    return <p className={styles.description}>Cargando solicitud…</p>
  }

  if (provider === null) {
    return (
      <section>
        <Link to="/app/usuarios" className={styles.back}>
          ← Volver al listado
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró la solicitud.'}
        </p>
      </section>
    )
  }

  const isPending = provider.registrationStatus === 'PENDING'

  async function run(
    action: () => Promise<ServiceProviderProfileResponse>,
    message: string,
  ) {
    if (provider === null) {
      return
    }

    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      const updated = await action()
      setProvider(updated)
      setFeedback(message)
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <section>
      <Link to="/app/usuarios" className={styles.back}>
        ← Volver al listado
      </Link>

      <PageHeader
        breadcrumb={[
          { label: 'Usuarios', to: '/app/usuarios' },
          { label: 'Solicitudes' },
          { label: 'Aprobar registro' },
        ]}
        title="Aprobar registro de prestador"
        description="Valida los datos y documentos antes de aprobar la cuenta."
        actions={
          <StatusBadge tone={REGISTRATION_TONES[provider.registrationStatus]}>
            {REGISTRATION_LABELS[provider.registrationStatus]}
          </StatusBadge>
        }
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      {feedback !== null && (
        <p className={`${styles.feedback} ${styles.success}`} role="status">
          {feedback}
        </p>
      )}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Datos de la solicitud</h2>
        <div className={styles.defList}>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Razón social</span>
            <span className={styles.defValue}>{provider.fullName}</span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>NIT</span>
            <span className={styles.defValue}>{provider.nit ?? '—'}</span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Correo</span>
            <span className={styles.defValue}>{provider.email ?? '—'}</span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Teléfono</span>
            <span className={styles.defValue}>{provider.phone ?? '—'}</span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Tipo de servicio</span>
            <span className={styles.defValue}>
              {provider.serviceType ?? '—'}
            </span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Ubicación</span>
            <span className={styles.defValue}>
              {provider.latitude !== null && provider.longitude !== null
                ? `${provider.latitude}, ${provider.longitude}`
                : '—'}
            </span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Inicio de operación</span>
            <span className={styles.defValue}>
              {provider.startOperationDate !== null
                ? formatDate(provider.startOperationDate)
                : '—'}
            </span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Estado de la cuenta</span>
            <span className={styles.defValue}>
              {STATUS_LABELS[provider.status]}
            </span>
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Validación de documentos</h2>
        <p className={`${styles.feedback} ${styles.warning}`}>
          El backend todavía no almacena los documentos de la solicitud. Cuando
          existan, se listan aquí con su estado de validación.
        </p>

        {REQUIRED_DOCUMENTS.map((document) => (
          <div key={document} className={styles.docRow}>
            <span>
              <span className={styles.docName}>{document}</span>
              <span className={styles.docMeta}>sin cargar</span>
            </span>
            <StatusBadge tone="neutral">No disponible</StatusBadge>
          </div>
        ))}
      </article>

      <div className={styles.actions}>
        <Button
          variant="primary"
          disabled={isWorking || !isPending}
          onClick={() =>
            void run(
              () => usersApi.approveProvider(provider.id),
              'Prestadora aprobada: la cuenta quedó activa.',
            )
          }
        >
          {isWorking ? 'Procesando…' : 'Aprobar'}
        </Button>
        <Button
          variant="outline"
          disabled={isWorking || !isPending}
          onClick={() =>
            void run(
              () => usersApi.rejectProvider(provider.id),
              'Registro rechazado.',
            )
          }
        >
          Rechazar
        </Button>
        {!isPending && (
          <p className={styles.actionsNote}>
            La solicitud ya fue{' '}
            {provider.registrationStatus === 'APPROVED'
              ? 'aprobada'
              : 'rechazada'}
            .
          </p>
        )}
      </div>
    </section>
  )
}
