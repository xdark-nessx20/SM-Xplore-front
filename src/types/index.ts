/** Identificador genérico de las entidades del dominio. */
export type Id = string

/** Respuesta paginada estándar del API. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
