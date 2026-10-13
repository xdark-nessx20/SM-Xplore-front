export type UserRole =
  | 'ADMIN'
  | 'GUIDE'
  | 'SERVICE_PROVIDER'
  | 'DESTINATION_MANAGER'
  | 'TOURIST'

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'INACTIVE'

export type DniType =
  | 'CITIZENSHIP_CARD'
  | 'FOREIGNER_ID'
  | 'PASSPORT'
  | 'TAX_ID'

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface UserResponse {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  signedUpAt: string
}

export interface UpdateUserProfileRequest {
  fullName: string
  email: string
  phone: string
}

export interface AssignRoleRequest {
  role: UserRole
}

/** El backend solo acepta `BLOCKED` o `SUSPENDED` para bloquear una cuenta. */
export interface BlockUserRequest {
  status: Extract<UserStatus, 'BLOCKED' | 'SUSPENDED'>
}

export interface ResetPasswordRequest {
  password: string
}

export interface UserSearchFilters {
  role?: UserRole
  status?: UserStatus
  term?: string
}

/** Los campos que el usuario no registró llegan como `null`. */
export interface GuideProfileResponse {
  id: string
  fullName: string
  email: string
  phone: string
  status: UserStatus
  license: string | null
  startOperationDate: string | null
}

/** Los campos que el usuario no registró llegan como `null`. */
export interface ServiceProviderProfileResponse {
  id: string
  fullName: string
  email: string
  phone: string
  status: UserStatus
  nit: string | null
  serviceType: string | null
  registrationStatus: RegistrationStatus
  latitude: number | null
  longitude: number | null
  startOperationDate: string | null
}
