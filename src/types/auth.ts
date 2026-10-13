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

/** Respuesta del login: token JWT + usuario autenticado. */
export interface AuthResponse {
  /** JWT firmado en HS256. */
  token: string
  /** Siempre "Bearer". */
  tokenType: string
  /** Vida del token en segundos. */
  expiresIn: number
  user: UserResponse
}

/** El login devuelve token y usuario. */
export type LoginResponse = AuthResponse

/** El registro solo devuelve el usuario (hay que iniciar sesión después). */
export type RegisterResponse = UserResponse
