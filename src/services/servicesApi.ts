import { httpClient } from './httpClient'
import type {
  AddAttributesRequest,
  ChangePriceRequest,
  ServiceListFilters,
  ServicePhotosRequest,
  ServiceRequest,
  ServiceResponse,
  ServiceSearchFilters,
} from '@/types'

/** Servicios turísticos ofrecidos por las prestadoras (alojamiento, transporte, alimentación). */
export const servicesApi = {
  /** `POST /api/v1/services` — 201, nace en `AVAILABLE`. */
  create: (payload: ServiceRequest) =>
    httpClient.post<ServiceResponse>('/services', payload),

  /** `GET /api/v1/services?status=` — `status` es obligatorio. */
  list: ({ status }: ServiceListFilters) =>
    httpClient.get<ServiceResponse[]>('/services', { query: { status } }),

  /** `GET /api/v1/services/{serviceId}` */
  getById: (serviceId: string) =>
    httpClient.get<ServiceResponse>(`/services/${serviceId}`),

  /** `GET /api/v1/services/search?type=&status=` — ambos obligatorios. */
  search: ({ type, status }: ServiceSearchFilters) =>
    httpClient.get<ServiceResponse[]>('/services/search', {
      query: { type, status },
    }),

  /** `GET /api/v1/services/provider/{providerId}` */
  listByProvider: (providerId: string) =>
    httpClient.get<ServiceResponse[]>(`/services/provider/${providerId}`),

  /** `PATCH /api/v1/services/{serviceId}/price` */
  changePrice: (serviceId: string, payload: ChangePriceRequest) =>
    httpClient.patch<ServiceResponse>(`/services/${serviceId}/price`, payload),

  /** `PUT /api/v1/services/{serviceId}/available` */
  markAvailable: (serviceId: string) =>
    httpClient.put<ServiceResponse>(`/services/${serviceId}/available`),

  /** `PUT /api/v1/services/{serviceId}/unavailable` */
  markUnavailable: (serviceId: string) =>
    httpClient.put<ServiceResponse>(`/services/${serviceId}/unavailable`),

  /** `POST /api/v1/services/{serviceId}/photos` */
  addPhotos: (serviceId: string, payload: ServicePhotosRequest) =>
    httpClient.post<ServiceResponse>(`/services/${serviceId}/photos`, payload),

  /** `POST /api/v1/services/{serviceId}/attributes` — 409 si el atributo ya existe. */
  addAttributes: (serviceId: string, payload: AddAttributesRequest) =>
    httpClient.post<ServiceResponse>(
      `/services/${serviceId}/attributes`,
      payload,
    ),
}
