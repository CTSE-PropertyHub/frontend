export type PropertyType = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND'
export type PropertyStatus = 'AVAILABLE' | 'RENTED' | 'UNDER_MAINTENANCE'

export interface Property {
  id: string
  title: string
  description?: string
  address: string
  city: string
  postalCode: string
  type: PropertyType
  status: PropertyStatus
  pricePerMonth: number
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
  landlordId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyRequest {
  title: string
  description?: string
  address: string
  city: string
  postalCode: string
  type: PropertyType
  pricePerMonth: number
  bedrooms?: number
  bathrooms?: number
  areaSqm?: number
}

export type UpdatePropertyRequest = CreatePropertyRequest
