import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/services/authApi'
import { isApiError } from '@/services/httpClient'
import { AuthShell } from './AuthShell'
import styles from './auth.module.css'

interface FromState {
  from?: { pathname?: string }
}

function describeAuthError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.status) {
      case 401:
        return 'Correo o contraseña incorrectos. Intenta de nuevo.'
      case 403:
        return 'La cuenta no está activa. Las prestadoras de servicios deben esperar la aprobación.'
      case 400:
        return `Datos inválidos: ${error.message}`
      default:
        return error.status >= 500
          ? 'El backend respondió con un error interno.'
          : error.message
    }
  }

  return 'No se pudo conectar con el backend. Verifica que esté corriendo en http://localhost:8080.'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as FromState | null
  const redirectTo = state?.from?.pathname ?? '/app'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (cause) {
      setError(describeAuthError(cause))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRecover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      // El backend responde 202 incluso si el correo no existe.
      await authApi.recoverPassword({ email: email.trim() })
      setIsRecovering(false)
      setNotice(
        'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.',
      )
    } catch (cause) {
      setError(describeAuthError(cause))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRecovering) {
    return (
      <AuthShell
        title="Recuperar contraseña"
        subtitle="Escribe el correo de tu cuenta y te enviaremos las instrucciones."
        footer={
          <p>
            <button
              type="button"
              className={styles.link}
              onClick={() => setIsRecovering(false)}
            >
              Volver a iniciar sesión
            </button>
          </p>
        }
      >
        <form className={styles.form} onSubmit={handleRecover} noValidate>
          {error !== null && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <Field
            label="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="laura.m@correo.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button
            className={styles.submit}
            variant="primary"
            size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
          </Button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta de SM-Xplore."
      footer={
        <p>
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error !== null && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {notice !== null && <p className={styles.notice}>{notice}</p>}

        <Field
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="laura.m@correo.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Field
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          trailing={
            <button
              type="button"
              className={styles.linkAccent}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          }
        />

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Recordarme
          </label>

          <button
            type="button"
            className={styles.link}
            onClick={() => {
              setIsRecovering(true)
              setError(null)
              setNotice(null)
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          className={styles.submit}
          variant="primary"
          size="lg"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthShell>
  )
}
