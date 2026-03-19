export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Inspection {
  id: string
  propertyId: string
  inspectorId: string
  requestedById: string
  scheduledAt: string
  status: InspectionStatus
  notes?: string
  report?: string
}

export interface CreateInspectionRequest {
  propertyId: string
  inspectorId: string
  scheduledAt: string
  notes?: string
}

export interface UpdateInspectionRequest {
  notes?: string
  report?: string
}
