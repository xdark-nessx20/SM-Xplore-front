import type { QueryLimit } from './common'

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLATION_REQUESTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'COMPLETED'

export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER'

export type ReservationItemType = 'EVENT' | 'ACTIVITY' | 'SERVICE'

export interface ReservationResponse {
  id: string
  touristId: string
  numberOfPeople: number
  total: number
  paymentMethod: PaymentMethod
  status: ReservationStatus
  bookedAt: string
  bookedFor: string
  notes: string | null
}

/** `total` no se envía: el backend lo recalcula a partir de los ítems. */
export interface ReservationRequest {
  touristId: string
  numberOfPeople: number
  paymentMethod: PaymentMethod
  bookedFor: string
  notes?: string
}

export interface ReservationItemResponse {
  id: string
  reservationId: string
  itemId: string
  type: ReservationItemType
  price: number
}

/**
 * Para ítems de tipo `SERVICE` el backend ignora `price` y usa el del catálogo;
 * para `ACTIVITY` y `EVENT` el precio es obligatorio.
 */
export interface ReservationItemRequest {
  itemId: string
  type: ReservationItemType
  price?: number
}

export interface ReservationItemsRequest {
  items: ReservationItemRequest[]
}

export interface ReservationListFilters {
  status: ReservationStatus
  limit?: QueryLimit
}

export interface ReservationByTouristFilters {
  limit?: QueryLimit
}

export interface ReservationItemListFilters {
  type: ReservationItemType
  limit?: QueryLimit
}
