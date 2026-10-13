import { httpClient } from './httpClient'
import type { Site, SiteInput, SiteUpdateInput } from '@/types'

/**
 * Sitios (atractivos) turísticos — `/api/v1/sites` (SM-Xplore-Proto).
 *
 * Cada sitio pertenece a una zona (`zoneId`) y guarda nombre, coordenadas y
 * fotos por URL. Lecturas públicas; crear y editar requieren gestora o admin.
 */
export const sitesApi = {
  /** `GET /api/v1/sites[?zoneId=]` — todos los sitios o los de una zona. */
  list: (zoneId?: string) =>
    httpClient.get<Site[]>('/sites', { query: { zoneId } }),

  /** `GET /api/v1/sites/{siteId}` */
  getById: (siteId: string) => httpClient.get<Site>(`/sites/${siteId}`),

  /** `POST /api/v1/sites` — 201; la zona debe existir. */
  create: (input: SiteInput) => httpClient.post<Site>('/sites', input),

  /** `PATCH /api/v1/sites/{siteId}` — parcial: solo se aplican los campos enviados. */
  update: (siteId: string, input: SiteUpdateInput) =>
    httpClient.patch<Site>(`/sites/${siteId}`, input),
}
