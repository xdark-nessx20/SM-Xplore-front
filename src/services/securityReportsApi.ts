import { httpClient } from './httpClient'
import type {
  ChangeReportTextRequest,
  CommentRequest,
  CommentResponse,
  SecurityReportListFilters,
  SecurityReportPhotosRequest,
  SecurityReportRequest,
  SecurityReportResponse,
} from '@/types'

export const securityReportsApi = {
  /** `POST /api/v1/security-reports` — 201, nace en `ONGOING`. */
  create: (payload: SecurityReportRequest) =>
    httpClient.post<SecurityReportResponse>('/security-reports', payload),

  /** `GET /api/v1/security-reports?status=` — `status` obligatorio. */
  list: ({ status }: SecurityReportListFilters) =>
    httpClient.get<SecurityReportResponse[]>('/security-reports', {
      query: { status },
    }),

  /** `GET /api/v1/security-reports/{reportId}` */
  getById: (reportId: string) =>
    httpClient.get<SecurityReportResponse>(`/security-reports/${reportId}`),

  /** `GET /api/v1/security-reports/users/{userId}` */
  listByUser: (userId: string) =>
    httpClient.get<SecurityReportResponse[]>(
      `/security-reports/users/${userId}`,
    ),

  /** `PATCH /api/v1/security-reports/{reportId}/text` */
  changeText: (reportId: string, payload: ChangeReportTextRequest) =>
    httpClient.patch<SecurityReportResponse>(
      `/security-reports/${reportId}/text`,
      payload,
    ),

  /** `POST /api/v1/security-reports/{reportId}/photos` */
  addPhotos: (reportId: string, payload: SecurityReportPhotosRequest) =>
    httpClient.post<SecurityReportResponse>(
      `/security-reports/${reportId}/photos`,
      payload,
    ),

  /** `POST /api/v1/security-reports/{reportId}/close` — pasa de `ONGOING` a `REPORTED`. */
  close: (reportId: string) =>
    httpClient.post<SecurityReportResponse>(
      `/security-reports/${reportId}/close`,
    ),

  /** `POST /api/v1/security-reports/{reportId}/solve` — pasa de `REPORTED` a `SOLVED`. */
  solve: (reportId: string) =>
    httpClient.post<SecurityReportResponse>(
      `/security-reports/${reportId}/solve`,
    ),

  /** `POST /api/v1/security-reports/{reportId}/comments` — 201. */
  addComment: (reportId: string, payload: CommentRequest) =>
    httpClient.post<CommentResponse>(
      `/security-reports/${reportId}/comments`,
      payload,
    ),

  /** `GET /api/v1/security-reports/{reportId}/comments` */
  listComments: (reportId: string) =>
    httpClient.get<CommentResponse[]>(
      `/security-reports/${reportId}/comments`,
    ),
}
