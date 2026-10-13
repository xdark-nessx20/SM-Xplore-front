const TOKEN_KEY = 'sm-xplore:token'
const USER_KEY = 'sm-xplore:user'

let token: string | null = null
let unauthorizedHandler: (() => void) | null = null

/** Token JWT actual (cacheado en memoria y en localStorage). */
export function loadToken(): string | null {
  if (token === null) {
    token = window.localStorage.getItem(TOKEN_KEY)
  }

  return token
}

export function saveToken(value: string) {
  token = value
  window.localStorage.setItem(TOKEN_KEY, value)
}

export function clearToken() {
  token = null
  window.localStorage.removeItem(TOKEN_KEY)
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_KEY)
}

/** Lo registra AuthProvider para cerrar sesión cuando la API responde 401. */
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler
}

export function notifyUnauthorized() {
  unauthorizedHandler?.()
}
