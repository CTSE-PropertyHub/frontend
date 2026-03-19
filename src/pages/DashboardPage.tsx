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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value ?? '—'}</p>
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
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.firstName}
        </h1>
        <p className="text-muted-foreground capitalize">{user?.role} account</p>
      </div>

      {user?.role === 'Landlord' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="My listings" value={myProperties?.length} to="/properties/my" />
            <StatCard label="My tenancies" value={tenancies?.length} to="/tenancies" />
            <StatCard label="My inspections" value={inspections?.length} to="/inspections" />
          </div>
          <div className="flex gap-3">
            <Button asChild><Link to="/properties/new">+ New Property</Link></Button>
            <Button asChild variant="outline"><Link to="/tenancies/new">+ New Tenancy</Link></Button>
            <Button asChild variant="outline"><Link to="/inspections/new">+ New Inspection</Link></Button>
          </div>
        </>
      )}

      {user?.role === 'Tenant' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard label="Available properties" value={allProperties?.length} to="/properties" />
            <StatCard label="My tenancies" value={tenancies?.length} to="/tenancies" />
          </div>
          <Button asChild variant="outline"><Link to="/properties">Browse properties</Link></Button>
        </>
      )}

      {user?.role === 'Inspector' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard label="Assigned inspections" value={inspections?.length} to="/inspections" />
            <StatCard
              label="Pending / In progress"
              value={inspections?.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS').length}
              to="/inspections"
            />
          </div>
          <Button asChild><Link to="/inspections">View inspections</Link></Button>
        </>
      )}

      {user?.role === 'Admin' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="All properties" value={allProperties?.length} to="/properties" />
            <StatCard label="All tenancies" value={tenancies?.length} to="/tenancies" />
            <StatCard label="All inspections" value={inspections?.length} to="/inspections" />
          </div>
          <div className="flex gap-3">
            <Button asChild><Link to="/properties">Manage properties</Link></Button>
            <Button asChild variant="outline"><Link to="/tenancies">Manage tenancies</Link></Button>
            <Button asChild variant="outline"><Link to="/inspections">Manage inspections</Link></Button>
          </div>
        </>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Your user ID</p>
        <p className="font-mono text-xs break-all">{user?.id}</p>
        <p className="mt-1">Share this ID with landlords or admins who need to create tenancies or inspections involving you.</p>
      </div>
    </div>
  )
}
