export type TenancyStatus = 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED'

export interface Tenancy {
  id: string
  propertyId: string
  landlordId: string
  tenantId: string
  startDate: string
  endDate?: string
  monthlyRent: number
  status: TenancyStatus
}

export interface CreateTenancyRequest {
  propertyId: string
  tenantId: string
  startDate: string
  endDate?: string
  monthlyRent: number
}
