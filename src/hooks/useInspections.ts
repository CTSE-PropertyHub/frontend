import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Inspection, CreateInspectionRequest, UpdateInspectionRequest } from '@/types/inspection'

export const useInspections = () =>
  useQuery({
    queryKey: ['inspections'],
    queryFn: () => api.get<Inspection[]>('/inspections').then(r => r.data),
  })

export const useInspection = (id: string) =>
  useQuery({
    queryKey: ['inspections', id],
    queryFn: () => api.get<Inspection>(`/inspections/${id}`).then(r => r.data),
    enabled: !!id,
  })

export const useCreateInspection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInspectionRequest) =>
      api.post<Inspection>('/inspections', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}

export const useUpdateInspection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInspectionRequest }) =>
      api.patch<Inspection>(`/inspections/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['inspections', id] })
    },
  })
}

export const useUpdateInspectionStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Inspection>(`/inspections/${id}/status`, { status }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['inspections'] })
      qc.invalidateQueries({ queryKey: ['inspections', id] })
    },
  })
}

export const useDeleteInspection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inspections/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}
