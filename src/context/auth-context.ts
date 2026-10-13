import { createContext } from 'react'
import type {
  LoginRequest,
  RegisterUserRequest,
  UserResponse,
} from '@/types'

export interface AuthContextValue {
  /** Usuario autenticado, o `null` si no hay sesión. */
  user: UserResponse | null
  isAuthenticated: boolean
  /** Inicia sesión contra `/api/v1/auth/login`. */
  login: (credentials: LoginRequest) => Promise<UserResponse>
  /** Registra un usuario y deja la sesión iniciada con el usuario creado. */
  register: (payload: RegisterUserRequest) => Promise<UserResponse>
  /** Cierra la sesión local (el prototipo no maneja tokens). */
  logout: () => void
  /** Refresca el usuario guardado tras editar el perfil. */
  updateSessionUser: (user: UserResponse) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
