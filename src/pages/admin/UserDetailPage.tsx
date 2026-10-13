import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar/Avatar'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { ROLE_LABELS, STATUS_LABELS, STATUS_TONES } from '@/config/roles'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'
import type { UserResponse } from '@/types'
import styles from './admin.module.css'

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()

  const [user, setUser] = useState<UserResponse | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (userId === undefined) {
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const found = await usersApi.getById(userId as string)
        if (!cancelled) {
          setUser(found)
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
  }, [userId])

  async function refresh() {
    if (userId === undefined) {
      return
    }

    try {
      const found = await usersApi.getById(userId)
      setUser(found)
    } catch {
      // El refresco es best-effort: la acción ya se confirmó.
    }
  }

  async function run(action: () => Promise<unknown>, message: string) {
    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      await action()
      setFeedback(message)
      await refresh()
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  if (isLoading) {
    return <p className={styles.description}>Cargando usuario…</p>
  }

  if (user === null) {
    return (
      <section>
        <Link to="/app/usuarios" className={styles.back}>
          ← Volver al listado
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró el usuario.'}
        </p>
      </section>
    )
  }

  return (
    <section>
      <Link to="/app/usuarios" className={styles.back}>
        ← Volver al listado
      </Link>

      <PageHeader
        breadcrumb={[{ label: 'Usuarios', to: '/app/usuarios' }, { label: 'Detalle' }]}
        title={user.fullName}
        description={user.email}
        actions={
          <>
            <StatusBadge tone={STATUS_TONES[user.status]}>
              {STATUS_LABELS[user.status]}
            </StatusBadge>
            <StatusBadge tone="info">{ROLE_LABELS[user.role]}</StatusBadge>
          </>
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

      <article className={styles.card}>
        <div className={styles.userCell}>
          <Avatar name={user.fullName} />
          <div>
            <p className={styles.userName}>{user.fullName}</p>
            <p className={styles.userEmail}>{user.phone}</p>
          </div>
        </div>

        <div className={styles.defList}>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Identificador</span>
            <span className={styles.defValue}>{user.id}</span>
          </div>
          <div className={styles.defRow}>
            <span className={styles.defLabel}>Registro</span>
            <span className={styles.defValue}>
              {formatDateTime(user.signedUpAt)}
            </span>
          </div>
        </div>
      </article>

      {user.status === 'INACTIVE' && (
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Solicitud de registro</h2>
          <p className={styles.description}>
            {user.role === 'GUIDE' &&
              'Guía turístico pendiente de aprobación.'}
            {user.role === 'DESTINATION_MANAGER' &&
              'Gestora de destinos pendiente de aprobación.'}
            {user.role === 'SERVICE_PROVIDER' &&
              (user.registrationStatus === 'REJECTED'
                ? 'El registro de esta prestadora fue rechazado.'
                : 'Prestadora pendiente de aprobación: revisa su solicitud y documentos.')}
          </p>
          <div className={styles.form}>
            {user.role === 'GUIDE' && (
              <Button
                variant="primary"
                disabled={isWorking}
                onClick={() =>
                  void run(
                    () => usersApi.approveGuide(user.id),
                    'Guía aprobado: la cuenta quedó activa.',
                  )
                }
              >
                Aprobar guía
              </Button>
            )}
            {user.role === 'DESTINATION_MANAGER' && (
              <Button
                variant="primary"
                disabled={isWorking}
                onClick={() =>
                  void run(
                    () => usersApi.approveManager(user.id),
                    'Gestora aprobada: la cuenta quedó activa.',
                  )
                }
              >
                Aprobar gestora
              </Button>
            )}
            {user.role === 'SERVICE_PROVIDER' && (
              <Link to={`/app/usuarios/prestadoras/${user.id}`}>
                <Button variant="primary">Revisar solicitud</Button>
              </Link>
            )}
          </div>
        </article>
      )}

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Estado de la cuenta</h2>
        <p className={styles.description}>
          El backend permite reactivar, bloquear o suspender una cuenta. El
          cambio de rol no está soportado: cada rol tiene su propio perfil.
        </p>
        <div className={styles.form}>
          {(user.status === 'BLOCKED' || user.status === 'SUSPENDED') && (
            <Button
              variant="primary"
              disabled={isWorking}
              onClick={() =>
                void run(
                  () => usersApi.changeStatus(user.id, { status: 'ACTIVE' }),
                  'Cuenta reactivada.',
                )
              }
            >
              Reactivar
            </Button>
          )}
          <Button
            variant="outline"
            disabled={isWorking || user.status === 'BLOCKED'}
            onClick={() =>
              void run(
                () => usersApi.changeStatus(user.id, { status: 'BLOCKED' }),
                'Cuenta bloqueada.',
              )
            }
          >
            Bloquear
          </Button>
          <Button
            variant="outline"
            disabled={isWorking || user.status === 'SUSPENDED'}
            onClick={() =>
              void run(
                () => usersApi.changeStatus(user.id, { status: 'SUSPENDED' }),
                'Cuenta suspendida.',
              )
            }
          >
            Suspender
          </Button>
        </div>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Restablecer contraseña</h2>
        <div className={styles.form}>
          <Field
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Button
            variant="accent"
            disabled={isWorking || newPassword.trim() === ''}
            onClick={() =>
              void run(async () => {
                await usersApi.resetPassword(user.id, {
                  password: newPassword,
                })
                setNewPassword('')
              }, 'Contraseña restablecida.')
            }
          >
            Restablecer
          </Button>
        </div>
      </article>

      {user.role === 'ADMIN' && (
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Permisos de administrador</h2>
          <p className={styles.description}>
            Retira el rol de administrador y deja la cuenta como turista.
          </p>
          <Button
            variant="outlineAccent"
            disabled={isWorking}
            onClick={() =>
              void run(
                () => usersApi.removeAdmin(user.id),
                'Permisos de administrador retirados.',
              )
            }
          >
            Quitar admin
          </Button>
        </article>
      )}
    </section>
  )
}
