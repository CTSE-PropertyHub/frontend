import { Badge } from '@/components/ui/badge'

const colourMap: Record<string, string> = {
  // Property
  AVAILABLE: 'bg-green-100 text-green-800',
  RENTED: 'bg-blue-100 text-blue-800',
  UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  // Tenancy
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  TERMINATED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  // Inspection
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function StatusBadge({ status }: { status: string }) {
  const colour = colourMap[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <Badge className={`${colour} border-0`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
