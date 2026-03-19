import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Property, CreatePropertyRequest, UpdatePropertyRequest } from '@/types/property'

export const useProperties = () =>
  useQuery({
    queryKey: ['properties'],
    queryFn: () => api.get<Property[]>('/properties').then(r => r.data),
  })

export const useMyProperties = () =>
  useQuery({
    queryKey: ['properties', 'my'],
    queryFn: () => api.get<Property[]>('/properties/my').then(r => r.data),
  })

export const useProperty = (id: string) =>
  useQuery({
    queryKey: ['properties', id],
    queryFn: () => api.get<Property>(`/properties/${id}`).then(r => r.data),
    enabled: !!id,
  })

export const useCreateProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePropertyRequest) =>
      api.post<Property>('/properties', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export const useUpdateProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyRequest }) =>
      api.put<Property>(`/properties/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      qc.invalidateQueries({ queryKey: ['properties', id] })
    },
  })
}

export const useUpdatePropertyStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Property>(`/properties/${id}/status`, { status }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      qc.invalidateQueries({ queryKey: ['properties', id] })
    },
  })
}

export const useDeleteProperty = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}
