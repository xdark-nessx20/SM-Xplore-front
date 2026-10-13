import { httpClient } from './httpClient'
import type { Zone, ZoneInput } from '@/types'

/**
 * Zonas turísticas — `/api/v1/zones` (SM-Xplore-Proto).
 *
 * El backend guarda solo el nombre de la zona: la relación con los sitios vive
 * en el sitio (`zoneId`), así que los sitios se consultan con `sitesApi`.
 * Lecturas públicas; crear y renombrar requieren gestora o admin.
 */
export const zonesApi = {
  /** `GET /api/v1/zones` — todas las zonas. */
  list: () => httpClient.get<Zone[]>('/zones'),

  /** `GET /api/v1/zones/{zoneId}` */
  getById: (zoneId: string) => httpClient.get<Zone>(`/zones/${zoneId}`),

  /** `POST /api/v1/zones` — 201; la zona nace solo con nombre. */
  create: (input: ZoneInput) => httpClient.post<Zone>('/zones', input),

  /** `PATCH /api/v1/zones/{zoneId}` — renombra la zona. */
  update: (zoneId: string, input: ZoneInput) =>
    httpClient.patch<Zone>(`/zones/${zoneId}`, input),
}
