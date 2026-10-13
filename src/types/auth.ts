import type { DniType, UserResponse, UserRole } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RecoverPasswordRequest {
  email: string
}

/**
 * Registro de usuario. Los campos opcionales aplican según el rol
 * (ver `UserWebMapper` en el backend).
 */
export interface RegisterUserRequest {
  fullName: string
  email: string
  phone: string
  password: string
  role: UserRole
  // Turista / guía / admin
  dniNumber?: string
  dniType?: DniType
  // Guía turístico
  license?: string
  // Gestora de destinos / prestadora
  nit?: string
  // Prestadora de servicios
  serviceType?: string
  latitude?: number
  longitude?: number
  // Turista
  preferredLanguage?: string
  birthDate?: string
  nationality?: string
  // Guía / gestora / prestadora
  startOperationDate?: string
}

/** El login del prototipo no devuelve token: solo el usuario autenticado. */
export type LoginResponse = UserResponse

/** El registro devuelve el usuario creado. */
export type RegisterResponse = UserResponse
