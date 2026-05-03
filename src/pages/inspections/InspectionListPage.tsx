import { Link } from 'react-router-dom'
import { useInspections } from '@/hooks/useInspections'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import PropertyTitle from '@/components/PropertyTitle'
import UserName from '@/components/UserName'

export default function InspectionListPage() {
  const { user } = useAuth()
  const { data: inspections, isLoading, isError } = useInspections()

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load inspections.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Inspections</h1>
        {(user?.role === 'Landlord' || user?.role === 'Admin' || user?.role === 'Tenant') && (
          <Button asChild size="sm">
            <Link to="/inspections/new">+ Schedule</Link>
          </Button>
        )}
      </div>

      {inspections?.length === 0 && (
        <p className="text-sm text-muted-foreground">No inspections found.</p>
      )}

      <div className="space-y-2">
        {inspections?.map(i => (
          <Link key={i.id} to={`/inspections/${i.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate"><PropertyTitle id={i.propertyId} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Inspector: <UserName id={i.inspectorId} /> · {new Date(i.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
