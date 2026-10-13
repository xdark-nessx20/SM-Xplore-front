import { httpClient } from './httpClient'
import type {
  ReceivedReservationsFilters,
  ReservationByItemFilters,
  ReservationByTouristFilters,
  ReservationItemListFilters,
  ReservationItemRequest,
  ReservationItemResponse,
  ReservationItemsRequest,
  ReservationListFilters,
  ReservationRequest,
  ReservationResponse,
} from '@/types'

export const reservationsApi = {
  /** `POST /api/v1/reservations` — 201, nace en `PENDING` con `total: 0`. */
  create: (payload: ReservationRequest) =>
    httpClient.post<ReservationResponse>('/reservations', payload),

  /** `GET /api/v1/reservations?status=&limit=` — `status` obligatorio, `limit` 1-200 (50 por defecto). */
  list: ({ status, limit }: ReservationListFilters) =>
    httpClient.get<ReservationResponse[]>('/reservations', {
      query: { status, limit },
    }),

  /** `GET /api/v1/reservations/{reservationId}` */
  getById: (reservationId: string) =>
    httpClient.get<ReservationResponse>(`/reservations/${reservationId}`),

  /** `GET /api/v1/reservations/tourists/{touristId}?limit=` */
  listByTourist: (
    touristId: string,
    { limit }: ReservationByTouristFilters = {},
  ) =>
    httpClient.get<ReservationResponse[]>(
      `/reservations/tourists/${touristId}`,
      { query: { limit } },
    ),

  /** `GET /api/v1/reservations/providers/{providerId}?status=&limit=` — la propia prestadora o staff. */
  listByProvider: (
    providerId: string,
    { status, limit }: ReceivedReservationsFilters = {},
  ) =>
    httpClient.get<ReservationResponse[]>(
      `/reservations/providers/${providerId}`,
      { query: { status, limit } },
    ),

  /** `GET /api/v1/reservations/guides/{guideId}?status=&limit=` — el propio guía o staff. */
  listByGuide: (
    guideId: string,
    { status, limit }: ReceivedReservationsFilters = {},
  ) =>
    httpClient.get<ReservationResponse[]>(`/reservations/guides/${guideId}`, {
      query: { status, limit },
    }),

  /**
   * `GET /api/v1/reservations/by-item?itemType=&itemId=&limit=` — reservas que
   * contienen una actividad o un servicio (la propia guía/prestadora o staff).
   */
  listByItem: ({ itemType, itemId, limit }: ReservationByItemFilters) =>
    httpClient.get<ReservationResponse[]>('/reservations/by-item', {
      query: { itemType, itemId, limit },
    }),

  /** `PATCH /api/v1/reservations/{reservationId}/confirm` */
  confirm: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/confirm`,
    ),

  /** `PATCH /api/v1/reservations/{reservationId}/reject` */
  reject: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/reject`,
    ),

  /** `PATCH /api/v1/reservations/{reservationId}/cancel` */
  cancel: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/cancel`,
    ),

  /** `PATCH /api/v1/reservations/{reservationId}/request-cancellation` */
  requestCancellation: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/request-cancellation`,
    ),

  /** `PATCH /api/v1/reservations/{reservationId}/attendance` */
  markAttendance: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/attendance`,
    ),

  /** `PATCH /api/v1/reservations/{reservationId}/no-show` */
  markNoShow: (reservationId: string) =>
    httpClient.patch<ReservationResponse>(
      `/reservations/${reservationId}/no-show`,
    ),

  /** `POST /api/v1/reservations/{reservationId}/items` — 201. */
  addItem: (reservationId: string, payload: ReservationItemRequest) =>
    httpClient.post<ReservationItemResponse>(
      `/reservations/${reservationId}/items`,
      payload,
    ),

  /** `POST /api/v1/reservations/{reservationId}/items/batch` — 201, máximo 50 ítems. */
  addItems: (reservationId: string, payload: ReservationItemsRequest) =>
    httpClient.post<ReservationItemResponse[]>(
      `/reservations/${reservationId}/items/batch`,
      payload,
    ),

  /** `GET /api/v1/reservations/{reservationId}/items` */
  listItems: (reservationId: string) =>
    httpClient.get<ReservationItemResponse[]>(
      `/reservations/${reservationId}/items`,
    ),

  /** `GET /api/v1/reservation-items/{reservationItemId}` */
  getItem: (reservationItemId: string) =>
    httpClient.get<ReservationItemResponse>(
      `/reservation-items/${reservationItemId}`,
    ),

  /** `GET /api/v1/reservation-items?type=&limit=` — `type` obligatorio. */
  listItemsByType: ({ type, limit }: ReservationItemListFilters) =>
    httpClient.get<ReservationItemResponse[]>('/reservation-items', {
      query: { type, limit },
    }),
}
