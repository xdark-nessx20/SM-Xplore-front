/** Cuerpo de error global del backend (`ApiErrorResponse`). */
export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

/** Límite de elementos de los endpoints paginados (el backend lo acota a 1-200). */
export type QueryLimit = number

/** Petición con lista de URLs de fotos (usada por servicios y reportes). */
export interface PhotosRequest {
  photosUrls: string[]
}

/** Ubicación geográfica. */
export interface LocationDto {
  latitude: number
  longitude: number
}

/** Referencia ligera a un usuario (reportes y comentarios). */
export interface UserRefDto {
  id: string
  name: string
}

/** Referencia ligera a una prestadora de servicios. */
export interface ProviderRefDto {
  id: string
  name: string
}

/** Valor admitido en los atributos extra: texto, número, booleano u objeto anidado. */
export type AttributeValue = string | number | boolean | AttributeDto

/** Atributo adicional de un servicio turístico. */
export interface AttributeDto {
  name: string
  value: AttributeValue
}
