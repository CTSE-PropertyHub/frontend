import { Link } from 'react-router-dom'
import { useInspections } from '@/hooks/useInspections'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'

export default function InspectionListPage() {
  const { user } = useAuth()
  const { data: inspections, isLoading, isError } = useInspections()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError) return <p className="text-destructive">Failed to load inspections.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inspections</h1>
        {(user?.role === 'Landlord' || user?.role === 'Admin') && (
          <Button asChild>
            <Link to="/inspections/new">+ New Inspection</Link>
          </Button>
        )}
      </div>
      {inspections?.length === 0 && (
        <p className="text-muted-foreground">No inspections found.</p>
      )}
      <div className="space-y-3">
        {inspections?.map(i => (
          <Link key={i.id} to={`/inspections/${i.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Property: <span className="text-foreground">{i.propertyId}</span>
                  </CardTitle>
                  <StatusBadge status={i.status} />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Scheduled</p>
                  <p className="font-medium">{new Date(i.scheduledAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inspector ID</p>
                  <p className="font-mono text-xs truncate">{i.inspectorId}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
