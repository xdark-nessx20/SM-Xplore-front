/** Una zona agrupa varios sitios o atractivos (zona ≠ sitio). */
export interface Zone {
  id: string
  name: string
}

/** Un sitio o atractivo turístico, ubicado en una zona. */
export interface Site {
  id: string
  zoneId: string
  name: string
  latitude: number
  longitude: number
  photoUrls: string[]
}

/** Datos que envía el formulario de zona (`POST /zones`). */
export interface ZoneInput {
  name: string
}

/** Datos que envía el formulario de sitio (`POST /sites`). */
export interface SiteInput {
  zoneId: string
  name: string
  latitude: number
  longitude: number
  photoUrls?: string[]
}

/**
 * Actualización parcial de un sitio (`PATCH /sites/{id}`): solo se aplican
 * los campos presentes en el cuerpo.
 */
export interface SiteUpdateInput {
  name?: string
  latitude?: number
  longitude?: number
  zoneId?: string
  photoUrls?: string[]
}
