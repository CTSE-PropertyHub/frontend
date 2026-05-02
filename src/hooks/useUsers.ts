import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface UserSummary {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface InspectorSummary {
  id: string
  firstName: string
  lastName: string
  email: string
}

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<UserSummary>(`/auth/users/${id}`).then(r => r.data),
    enabled: !!id,
  })

export const useInspectors = () =>
  useQuery({
    queryKey: ['inspectors'],
    queryFn: () => api.get<InspectorSummary[]>('/auth/inspectors').then(r => r.data),
  })
