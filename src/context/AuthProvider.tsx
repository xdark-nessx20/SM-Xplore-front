import type { ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { authApi } from '@/services/authApi'
import type { UserResponse } from '@/types'

const STORAGE_KEY = 'sm-xplore:user'

/**
 * Sesión del prototipo: el backend no emite tokens, así que se guarda el
 * `UserResponse` del login en `localStorage`. Suficiente para el prototipo,
 * pero no es autenticación real.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UserResponse | null>(STORAGE_KEY, null)

  async function login(credentials: Parameters<typeof authApi.login>[0]) {
    const authenticated = await authApi.login(credentials)
    setUser(authenticated)
    return authenticated
  }

  async function register(payload: Parameters<typeof authApi.register>[0]) {
    const created = await authApi.register(payload)
    // Las prestadoras nacen en `INACTIVE`: no se les abre sesión, se avisa en pantalla.
    if (created.status === 'ACTIVE') {
      setUser(created)
    }
    return created
  }

  function logout() {
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
