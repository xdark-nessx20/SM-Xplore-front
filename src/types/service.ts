import type {
  AttributeDto,
  LocationDto,
  PhotosRequest,
  ProviderRefDto,
} from './common'

export type ServiceType = 'TRANSPORT' | 'LODGING' | 'FEEDING'

export type ServiceStatus = 'AVAILABLE' | 'UNAVAILABLE'

export interface ServiceResponse {
  id: string
  name: string
  type: ServiceType
  provider: ProviderRefDto
  location: LocationDto
  price: number
  photosUrls: string[]
  status: ServiceStatus
  createdAt: string
  extras: AttributeDto[]
}

export interface ServiceRequest {
  provider: ProviderRefDto
  name: string
  type: ServiceType
  price: number
  location: LocationDto
  photosUrls?: string[]
  extras?: AttributeDto[]
}

export interface ChangePriceRequest {
  price: number
}

export interface AddAttributesRequest {
  attributes: AttributeDto[]
}

export type ServicePhotosRequest = PhotosRequest

export interface ServiceListFilters {
  status: ServiceStatus
}

export interface ServiceSearchFilters {
  type: ServiceType
  status: ServiceStatus
}
