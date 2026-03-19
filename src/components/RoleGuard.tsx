import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types/auth'

interface Props {
  roles: Role[]
  children: React.ReactNode
}

export default function RoleGuard({ roles, children }: Props) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return null
  return <>{children}</>
}
