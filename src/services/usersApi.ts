import { httpClient } from './httpClient'
import type {
  AssignRoleRequest,
  BlockUserRequest,
  GuideProfileResponse,
  ResetPasswordRequest,
  ServiceProviderProfileResponse,
  UpdateUserProfileRequest,
  UserResponse,
  UserSearchFilters,
} from '@/types'

export const usersApi = {
  /** `GET /api/v1/users` — lista completa de usuarios. */
  list: () => httpClient.get<UserResponse[]>('/users'),

  /** `GET /api/v1/users/{userId}` */
  getById: (userId: string) => httpClient.get<UserResponse>(`/users/${userId}`),

  /** `GET /api/v1/users/search` — todos los filtros son opcionales. */
  search: (filters: UserSearchFilters) =>
    httpClient.get<UserResponse[]>('/users/search', { query: { ...filters } }),

  /** `PUT /api/v1/users/{userId}` — el usuario edita su propio perfil. */
  updateProfile: (userId: string, payload: UpdateUserProfileRequest) =>
    httpClient.put<UserResponse>(`/users/${userId}`, payload),

  /** `DELETE /api/v1/users/{userId}` — el usuario elimina su cuenta (204). */
  deleteAccount: (userId: string) =>
    httpClient.delete<void>(`/users/${userId}`),

  /** `PATCH /api/v1/users/{userId}/role` — solo admin. */
  assignRole: (userId: string, payload: AssignRoleRequest) =>
    httpClient.patch<UserResponse>(`/users/${userId}/role`, payload),

  /** `PATCH /api/v1/users/{userId}/status` — solo `BLOCKED` o `SUSPENDED`. */
  block: (userId: string, payload: BlockUserRequest) =>
    httpClient.patch<UserResponse>(`/users/${userId}/status`, payload),

  /** `DELETE /api/v1/users/{userId}/admin` — degrada a un administrador (204). */
  removeAdmin: (userId: string) =>
    httpClient.delete<void>(`/users/${userId}/admin`),

  /** `POST /api/v1/users/{userId}/reset-password` — 204. */
  resetPassword: (userId: string, payload: ResetPasswordRequest) =>
    httpClient.post<void>(`/users/${userId}/reset-password`, payload),

  /** `GET /api/v1/users/guides/{guideId}` */
  getGuideProfile: (guideId: string) =>
    httpClient.get<GuideProfileResponse>(`/users/guides/${guideId}`),

  /** `GET /api/v1/users/providers/{providerId}` */
  getProviderProfile: (providerId: string) =>
    httpClient.get<ServiceProviderProfileResponse>(
      `/users/providers/${providerId}`,
    ),
}
