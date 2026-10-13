import { httpClient } from './httpClient'
import type {
  ActivityRequest,
  ActivityResponse,
  ActivitySearchFilters,
  AvailabilityRequest,
  ChangeActivityStatusRequest,
  SlotsRequest,
  UpdateActivityRequest,
} from '@/types'

export const activitiesApi = {
  /** `POST /api/v1/activities` — 201, nace en `DRAFT`. */
  create: (payload: ActivityRequest) =>
    httpClient.post<ActivityResponse>('/activities', payload),

  /** `GET /api/v1/activities` */
  list: () => httpClient.get<ActivityResponse[]>('/activities'),

  /** `GET /api/v1/activities/{activityId}` */
  getById: (activityId: string) =>
    httpClient.get<ActivityResponse>(`/activities/${activityId}`),

  /** `GET /api/v1/activities/search` — `category` es obligatorio. */
  search: ({ category }: ActivitySearchFilters) =>
    httpClient.get<ActivityResponse[]>('/activities/search', {
      query: { category },
    }),

  /** `GET /api/v1/activities/site/{siteId}` */
  listBySite: (siteId: string) =>
    httpClient.get<ActivityResponse[]>(`/activities/site/${siteId}`),

  /** `PATCH /api/v1/activities/{activityId}` — nombre, categoría, descripción y precio. */
  update: (activityId: string, payload: UpdateActivityRequest) =>
    httpClient.patch<ActivityResponse>(`/activities/${activityId}`, payload),

  /** `PATCH /api/v1/activities/{activityId}/availability` */
  setAvailability: (activityId: string, payload: AvailabilityRequest) =>
    httpClient.patch<ActivityResponse>(
      `/activities/${activityId}/availability`,
      payload,
    ),

  /** `PATCH /api/v1/activities/{activityId}/slots` */
  setSlots: (activityId: string, payload: SlotsRequest) =>
    httpClient.patch<ActivityResponse>(
      `/activities/${activityId}/slots`,
      payload,
    ),

  /** `POST /api/v1/activities/{activityId}/cancel` */
  cancel: (activityId: string) =>
    httpClient.post<ActivityResponse>(`/activities/${activityId}/cancel`),

  /** `PATCH /api/v1/activities/{activityId}/status` */
  changeStatus: (activityId: string, payload: ChangeActivityStatusRequest) =>
    httpClient.patch<ActivityResponse>(
      `/activities/${activityId}/status`,
      payload,
    ),
}
