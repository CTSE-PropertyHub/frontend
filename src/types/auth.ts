export type Role = 'Landlord' | 'Tenant' | 'Inspector' | 'Admin'

export interface AuthUser {
  id: string
  email: string
  role: Role
  firstName: string
  lastName: string
}

export interface JwtClaims {
  sub: string
  email: string
  role: Role
  given_name: string
  family_name: string
  exp: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'Landlord' | 'Tenant'
}

export interface LoginResponse {
  token: string
  expiresAt: string
  userId: string
  email: string
  role: Role
}
