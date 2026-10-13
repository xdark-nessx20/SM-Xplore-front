import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field, SelectField } from '@/components/FormField'
import { REGISTERABLE_ROLES, ROLE_LABELS } from '@/config/roles'
import { useAuth } from '@/hooks/useAuth'
import { isApiError } from '@/services/httpClient'
import type {
  DniType,
  RegisterUserRequest,
  ServiceType,
  UserResponse,
  UserRole,
} from '@/types'
import { AuthShell } from './AuthShell'
import styles from './auth.module.css'

interface FormState {
  fullName: string
  email: string
  phone: string
  password: string
  role: UserRole
  dniType: DniType | ''
  dniNumber: string
  license: string
  nit: string
  serviceType: ServiceType | ''
  latitude: string
  longitude: string
  startOperationDate: string
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'TOURIST',
  dniType: '',
  dniNumber: '',
  license: '',
  nit: '',
  serviceType: '',
  latitude: '',
  longitude: '',
  startOperationDate: '',
}

const ROLE_OPTIONS = REGISTERABLE_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

const DNI_TYPE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'CITIZENSHIP_CARD', label: 'Cédula de ciudadanía' },
  { value: 'FOREIGNER_ID', label: 'Cédula de extranjería' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'TAX_ID', label: 'NIT' },
]

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'LODGING', label: 'Alojamiento' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'FEEDING', label: 'Alimentación' },
]

/** Envía solo los campos diligenciados: el backend valida según el rol. */
function buildPayload(form: FormState): RegisterUserRequest {
  const payload: RegisterUserRequest = {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    role: form.role,
  }

  if (form.dniNumber !== '') payload.dniNumber = form.dniNumber.trim()
  if (form.dniType !== '') payload.dniType = form.dniType
  if (form.license !== '') payload.license = form.license.trim()
  if (form.nit !== '') payload.nit = form.nit.trim()
  if (form.serviceType !== '') payload.serviceType = form.serviceType
  if (form.latitude !== '') payload.latitude = Number(form.latitude)
  if (form.longitude !== '') payload.longitude = Number(form.longitude)
  if (form.startOperationDate !== '') {
    payload.startOperationDate = form.startOperationDate
  }

  return payload
}

/** Campos que el backend exige según el rol (los demás quedan opcionales). */
function validate(form: FormState): string | null {
  if (form.fullName.trim() === '') {
    return 'Escribe tu nombre completo.'
  }
  if (form.email.trim() === '') {
    return 'Escribe tu correo electrónico.'
  }
  if (form.phone.trim() === '') {
    return 'Escribe tu teléfono.'
  }
  if (form.password === '') {
    return 'Escribe una contraseña.'
  }

  if (form.role === 'TOURIST' || form.role === 'GUIDE') {
    if (form.dniType === '') {
      return 'Selecciona el tipo de documento.'
    }
    if (form.dniNumber.trim() === '') {
      return 'Escribe el número de documento.'
    }
  }

  if (form.role === 'GUIDE' && form.license.trim() === '') {
    return 'Escribe la tarjeta profesional de guía.'
  }

  if (
    (form.role === 'SERVICE_PROVIDER' ||
      form.role === 'DESTINATION_MANAGER') &&
    form.nit.trim() === ''
  ) {
    return 'Escribe el NIT.'
  }

  return null
}

function describeRegisterError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 409) {
      return `Ya existe una cuenta con esos datos: ${error.message}`
    }
    if (error.status === 400) {
      return `Revisa los datos: ${error.message}`
    }
    return error.message
  }

  return 'No se pudo conectar con el backend. Verifica que esté corriendo en http://localhost:8080.'
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<UserResponse | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validationError = validate(form)
    if (validationError !== null) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const user = await register(buildPayload(form))
      if (user.status === 'ACTIVE') {
        navigate('/app', { replace: true })
      } else {
        setCreated(user)
      }
    } catch (cause) {
      setError(describeRegisterError(cause))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTourist = form.role === 'TOURIST'
  const isGuide = form.role === 'GUIDE'
  const isProvider = form.role === 'SERVICE_PROVIDER'
  const isDestinationManager = form.role === 'DESTINATION_MANAGER'
  const needsNit = isProvider || isDestinationManager
  const needsOperationDate = isGuide || isProvider || isDestinationManager

  if (created !== null) {
    return (
      <AuthShell
        title="Cuenta creada"
        subtitle={`${ROLE_LABELS[created.role]}: ${created.status === 'INACTIVE' ? 'pendiente de aprobación' : 'activa'}`}
        footer={
          <p>
            <Link to="/login">Ir a iniciar sesión</Link>
          </p>
        }
      >
        <p className={styles.notice}>
          {created.status === 'INACTIVE'
            ? `Tu cuenta quedó registrada con el correo ${created.email}. Un administrador debe aprobar el registro antes de que puedas iniciar sesión.`
            : `Tu cuenta quedó registrada con el correo ${created.email}. Ya puedes iniciar sesión.`}
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate según tu rol en la plataforma."
      footer={
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error !== null && <p className={styles.error}>{error}</p>}

        <SelectField
          label="Rol"
          name="role"
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={(event) => update('role', event.target.value as UserRole)}
        />

        <Field
          label="Nombre completo"
          name="fullName"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={(event) => update('fullName', event.target.value)}
        />

        <div className={styles.grid}>
          <Field
            label="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
          <Field
            label="Teléfono"
            name="phone"
            autoComplete="tel"
            required
            hint="Entre 7 y 20 dígitos; admite +, (), - y espacios."
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
          />
        </div>

        <Field
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
        />

        {(isTourist || isGuide) && (
          <>
            <p className={styles.groupTitle}>Documento</p>
            <div className={styles.grid}>
              <SelectField
                label="Tipo de documento"
                name="dniType"
                required
                options={DNI_TYPE_OPTIONS}
                value={form.dniType}
                onChange={(event) =>
                  update('dniType', event.target.value as DniType | '')
                }
              />
              <Field
                label="Número de documento"
                name="dniNumber"
                required
                value={form.dniNumber}
                onChange={(event) => update('dniNumber', event.target.value)}
              />
            </div>
          </>
        )}

        {isGuide && (
          <Field
            label="Tarjeta profesional de guía"
            name="license"
            required
            hint="Número de RNT del guía."
            value={form.license}
            onChange={(event) => update('license', event.target.value)}
          />
        )}

        {needsNit && (
          <Field
            label="NIT"
            name="nit"
            required
            hint="Requerido para prestadoras de servicios y gestoras de destinos."
            value={form.nit}
            onChange={(event) => update('nit', event.target.value)}
          />
        )}

        {isProvider && (
          <>
            <p className={styles.groupTitle}>Servicio que ofrece</p>
            <div className={styles.grid}>
              <SelectField
                label="Tipo de servicio"
                name="serviceType"
                options={SERVICE_TYPE_OPTIONS}
                value={form.serviceType}
                onChange={(event) =>
                  update('serviceType', event.target.value as ServiceType | '')
                }
              />
              <Field
                label="Latitud"
                name="latitude"
                inputMode="decimal"
                value={form.latitude}
                onChange={(event) => update('latitude', event.target.value)}
              />
              <Field
                label="Longitud"
                name="longitude"
                inputMode="decimal"
                value={form.longitude}
                onChange={(event) => update('longitude', event.target.value)}
              />
            </div>
          </>
        )}

        {needsOperationDate && (
          <Field
            label="Fecha de inicio de operación"
            type="date"
            name="startOperationDate"
            value={form.startOperationDate}
            onChange={(event) =>
              update('startOperationDate', event.target.value)
            }
          />
        )}

        <Button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  )
}
