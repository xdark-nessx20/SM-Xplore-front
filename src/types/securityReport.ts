import type { LocationDto, PhotosRequest, UserRefDto } from './common'

export type SecurityReportStatus = 'ONGOING' | 'REPORTED' | 'SOLVED'

export interface SecurityReportResponse {
  id: string
  user: UserRefDto
  text: string
  location: LocationDto | null
  photosUrls: string[]
  status: SecurityReportStatus
  createdAt: string
}

export interface SecurityReportRequest {
  user: UserRefDto
  text: string
  location?: LocationDto
  photosUrls?: string[]
}

export interface ChangeReportTextRequest {
  text: string
}

export interface CommentRequest {
  user: UserRefDto
  content: string
}

export interface CommentResponse {
  id: string
  reportId: string
  user: UserRefDto
  content: string
}

export type SecurityReportPhotosRequest = PhotosRequest

export interface SecurityReportListFilters {
  status: SecurityReportStatus
}
