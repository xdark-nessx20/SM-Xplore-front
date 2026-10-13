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
import type { UserResponse, UserRole } from '@/types'
import styles from './admin.module.css'

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()

  const [user, setUser] = useState<UserResponse | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>('TOURIST')
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
          setSelectedRole(found.role)
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
      setSelectedRole(found.role)
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

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Asignar rol</h2>
        <div className={styles.form}>
          <select
            className={styles.select}
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(event.target.value as UserRole)
            }
            aria-label="Rol"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            disabled={isWorking}
            onClick={() =>
              void run(
                () => usersApi.assignRole(user.id, { role: selectedRole }),
                'Rol actualizado.',
              )
            }
          >
            Guardar rol
          </Button>
        </div>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Estado de la cuenta</h2>
        <p className={styles.description}>
          El backend solo permite bloquear o suspender una cuenta desde aquí.
        </p>
        <div className={styles.form}>
          <Button
            variant="outline"
            disabled={isWorking}
            onClick={() =>
              void run(
                () => usersApi.block(user.id, { status: 'BLOCKED' }),
                'Cuenta bloqueada.',
              )
            }
          >
            Bloquear
          </Button>
          <Button
            variant="outline"
            disabled={isWorking}
            onClick={() =>
              void run(
                () => usersApi.block(user.id, { status: 'SUSPENDED' }),
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
