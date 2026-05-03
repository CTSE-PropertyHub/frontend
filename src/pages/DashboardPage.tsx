import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProperties, useMyProperties } from '@/hooks/useProperties'
import { useTenancies } from '@/hooks/useTenancies'
import { useInspections } from '@/hooks/useInspections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function StatCard({ label, value, to }: { label: string; value?: number; to: string }) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-5 pb-4">
          <p className="text-3xl font-bold">{value ?? '—'}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: allProperties } = useProperties()
  const { data: myProperties } = useMyProperties()
  const { data: tenancies } = useTenancies()
  const { data: inspections } = useInspections()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user?.role} account</p>
      </div>

      {user?.role === 'Landlord' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard label="My listings" value={myProperties?.length} to="/properties/my" />
            <StatCard label="Rental bids" value={tenancies?.length} to="/tenancies" />
            <StatCard label="Inspections" value={inspections?.length} to="/inspections" />
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm"><Link to="/properties/new">+ New Property</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/inspections/new">+ Schedule Inspection</Link></Button>
          </div>
        </>
      )}

      {user?.role === 'Tenant' && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <StatCard label="Available properties" value={allProperties?.length} to="/properties" />
            <StatCard label="My tenancies" value={tenancies?.length} to="/tenancies" />
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm"><Link to="/properties">Browse properties</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/tenancies/new">Place a bid</Link></Button>
          </div>
        </>
      )}

      {user?.role === 'Inspector' && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <StatCard label="Assigned inspections" value={inspections?.length} to="/inspections" />
            <StatCard
              label="Pending / In progress"
              value={inspections?.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length}
              to="/inspections"
            />
          </div>
          <Button asChild size="sm"><Link to="/inspections">View inspections</Link></Button>
        </>
      )}

      {user?.role === 'Admin' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatCard label="All properties" value={allProperties?.length} to="/properties" />
            <StatCard label="All tenancies" value={tenancies?.length} to="/tenancies" />
            <StatCard label="All inspections" value={inspections?.length} to="/inspections" />
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm"><Link to="/properties">Properties</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/tenancies">Tenancies</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/inspections">Inspections</Link></Button>
          </div>
        </>
      )}
    </div>
  )
}
