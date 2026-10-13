import type { ApiErrorResponse } from '@/types'

const BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api/v1'

/** Parámetros de query string; los valores vacíos se omiten. */
export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: QueryParams
}

/** Error de la API con el código HTTP y el cuerpo de error del backend. */
export class ApiError extends Error {
  readonly status: number
  readonly payload: ApiErrorResponse | undefined

  constructor(message: string, status: number, payload?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function buildQuery(params?: QueryParams): string {
  if (!params) {
    return ''
  }

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }

  const query = search.toString()
  return query === '' ? '' : `?${query}`
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: ApiErrorResponse | undefined

  try {
    const text = await response.text()
    payload = text === '' ? undefined : (JSON.parse(text) as ApiErrorResponse)
  } catch {
    // Respuesta de error sin cuerpo JSON.
  }

  const message = payload?.message ?? `${response.status} ${response.statusText}`
  return new ApiError(message, response.status, payload)
}

async function request<T>(
  path: string,
  { body, query, headers: rawHeaders, ...rest }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(rawHeaders)
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
    ...rest,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return text === '' ? (undefined as T) : (JSON.parse(text) as T)
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
