import type {
  BadgeTone,
  RegistrationStatus,
  ServiceType,
  UserRole,
  UserStatus,
} from '@/types'

/** Nombre legible de cada rol (los cinco actores del SRS). */
export const ROLE_LABELS: Record<UserRole, string> = {
  TOURIST: 'Turista',
  GUIDE: 'Guía turístico',
  SERVICE_PROVIDER: 'Prestadora de servicios',
  DESTINATION_MANAGER: 'Gestora de destinos',
  ADMIN: 'Administrador',
}

/** Nombre legible del estado de una cuenta. */
export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  BLOCKED: 'Bloqueado',
  SUSPENDED: 'Suspendido',
  INACTIVE: 'Inactivo',
}

/** Color de la etiqueta según el estado de la cuenta. */
export const STATUS_TONES: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  BLOCKED: 'danger',
  SUSPENDED: 'warning',
  INACTIVE: 'neutral',
}

/** Estado del registro de una prestadora de servicios. */
export const REGISTRATION_LABELS: Record<RegistrationStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

export const REGISTRATION_TONES: Record<RegistrationStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

/** Nombre legible del tipo de servicio turístico. */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  TRANSPORT: 'Transporte',
  LODGING: 'Alojamiento',
  FEEDING: 'Alimentación',
}

/** Rol por defecto para registrarse desde el formulario público. */
export const REGISTERABLE_ROLES: UserRole[] = [
  'TOURIST',
  'GUIDE',
  'SERVICE_PROVIDER',
  'DESTINATION_MANAGER',
]
