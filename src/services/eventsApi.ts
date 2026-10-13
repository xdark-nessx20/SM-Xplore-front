import { httpClient } from './httpClient'
import type {
  ChangeEventStatusRequest,
  EstimateAttendanceRequest,
  EventRequest,
  EventResponse,
  EventSearchFilters,
} from '@/types'

export const eventsApi = {
  /** `POST /api/v1/events` — 201, el evento nace en `DRAFT`. */
  create: (payload: EventRequest) =>
    httpClient.post<EventResponse>('/events', payload),

  /** `GET /api/v1/events` — todos los eventos. */
  list: () => httpClient.get<EventResponse[]>('/events'),

  /** `GET /api/v1/events/{eventId}` */
  getById: (eventId: string) =>
    httpClient.get<EventResponse>(`/events/${eventId}`),

  /** `GET /api/v1/events/search` — `name` es obligatorio. */
  search: ({ name }: EventSearchFilters) =>
    httpClient.get<EventResponse[]>('/events/search', { query: { name } }),

  /** `PATCH /api/v1/events/{eventId}/status` — transiciones validadas en el dominio. */
  changeStatus: (eventId: string, payload: ChangeEventStatusRequest) =>
    httpClient.patch<EventResponse>(`/events/${eventId}/status`, payload),

  /** `PATCH /api/v1/events/{eventId}/attendance` */
  estimateAttendance: (eventId: string, payload: EstimateAttendanceRequest) =>
    httpClient.patch<EventResponse>(`/events/${eventId}/attendance`, payload),
}
