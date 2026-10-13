import { httpClient } from './httpClient'
import type {
  LoginRequest,
  LoginResponse,
  RecoverPasswordRequest,
  RegisterUserRequest,
  RegisterResponse,
} from '@/types'

export const authApi = {
  /** `POST /api/v1/auth/login` — 200 con el usuario, 401 credenciales, 403 cuenta inactiva. */
  login: (payload: LoginRequest) =>
    httpClient.post<LoginResponse>('/auth/login', payload),

  /**
   * `POST /api/v1/auth/register` — 201 con el usuario creado.
   * Ojo: las prestadoras nacen en estado `INACTIVE` y no pueden iniciar sesión.
   */
  register: (payload: RegisterUserRequest) =>
    httpClient.post<RegisterResponse>('/auth/register', payload),

  /** `POST /api/v1/auth/recover-password` — 202 siempre (no revela si el correo existe). */
  recoverPassword: (payload: RecoverPasswordRequest) =>
    httpClient.post<void>('/auth/recover-password', payload),
}
