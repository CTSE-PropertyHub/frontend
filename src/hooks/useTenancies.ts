import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Tenancy, CreateTenancyRequest } from '@/types/tenancy'

export const useTenancies = () =>
  useQuery({
    queryKey: ['tenancies'],
    queryFn: () => api.get<Tenancy[]>('/tenancy').then(r => r.data),
  })

export const useTenancy = (id: string) =>
  useQuery({
    queryKey: ['tenancies', id],
    queryFn: () => api.get<Tenancy>(`/tenancy/${id}`).then(r => r.data),
    enabled: !!id,
  })

export const useCreateTenancy = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenancyRequest) =>
      api.post<Tenancy>('/tenancy', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenancies'] })
    },
  })
}

export const useUpdateTenancyStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Tenancy>(`/tenancy/${id}/status`, { status }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['tenancies'] })
      qc.invalidateQueries({ queryKey: ['tenancies', id] })
    },
  })
}

export const useDeleteTenancy = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tenancy/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenancies'] })
    },
  })
}
