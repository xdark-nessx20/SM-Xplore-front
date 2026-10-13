/** Una zona agrupa varios sitios o atractivos (zona ≠ sitio). */
export type ZoneStatus = 'NORMAL' | 'CONGESTED'

export interface SiteRef {
  id: string
  name: string
}

export interface Zone {
  id: string
  name: string
  description: string
  /** Capacidad recomendada de la zona, en personas. */
  recommendedCapacity: number
  /** Porcentaje de ocupación que dispara el estado congestionado. */
  congestionThreshold: number
  /** Sitios o atractivos que agrupa la zona. */
  sites: SiteRef[]
  /** Delimitación de la zona; el diseño la dibuja sobre un mapa. */
  boundary: {
    minLatitude: number
    minLongitude: number
    maxLatitude: number
    maxLongitude: number
  } | null
  status: ZoneStatus
  /** Ocupación actual en porcentaje: alimenta la barra del listado. */
  currentOccupancy: number
}

/** Datos que envía el formulario de zona. */
export type ZoneInput = Omit<Zone, 'id' | 'currentOccupancy'>
