import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { authApi } from '@/services/authApi'
import { clearToken, clearStoredUser, onUnauthorized, saveToken } from '@/services/authToken'
import type { UserResponse } from '@/types'

const STORAGE_KEY = 'sm-xplore:user'

/**
 * Sesión con JWT. El token viaja en `Authorization: Bearer` (lo añade
 * `httpClient`) y se guarda junto al usuario en `localStorage`.
 * No hay refresh: al expirar (60 min) la API responde 401 y se cierra sesión.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UserResponse | null>(STORAGE_KEY, null)

  useEffect(() => {
    // Sesión inválida: usuario guardado sin token (p. ej. tras limpiar el token).
    if (user !== null && window.localStorage.getItem('sm-xplore:token') === null) {
      setUser(null)
    }

    onUnauthorized(() => {
      clearToken()
      clearStoredUser()
      setUser(null)
    })
  }, [user, setUser])

  async function login(credentials: Parameters<typeof authApi.login>[0]) {
    const response = await authApi.login(credentials)
    saveToken(response.token)
    setUser(response.user)
    return response.user
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const created = await authApi.register(payload)

    // El registro no devuelve token. Si la cuenta queda activa se inicia
    // sesión; si es prestadora, queda pendiente de aprobación.
    if (created.status === 'ACTIVE') {
      return login({ email: payload.email, password: payload.password })
    }

    return created
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        updateSessionUser: setUser,
      }}
    >
      {children}
    </AuthContext>
  )
}
