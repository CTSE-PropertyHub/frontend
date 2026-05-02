import { Link } from 'react-router-dom'
import { useTenancies } from '@/hooks/useTenancies'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import PropertyTitle from '@/components/PropertyTitle'

export default function TenancyListPage() {
  const { user } = useAuth()
  const { data: tenancies, isLoading, isError } = useTenancies()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError) return <p className="text-destructive">Failed to load tenancies.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {user?.role === 'Landlord' ? 'Rental Bids' : 'My Tenancies'}
        </h1>
        {user?.role === 'Tenant' && (
          <Button asChild>
            <Link to="/tenancies/new">+ Place a Bid</Link>
          </Button>
        )}
      </div>
      {tenancies?.length === 0 && (
        <p className="text-muted-foreground">No tenancies found.</p>
      )}
      <div className="space-y-3">
        {tenancies?.map(t => (
          <Link key={t.id} to={`/tenancies/${t.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    <PropertyTitle id={t.propertyId} />
                  </CardTitle>
                  <StatusBadge status={t.status} />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Bid / month</p>
                  <p className="font-medium">${t.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start date</p>
                  <p className="font-medium">{new Date(t.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End date</p>
                  <p className="font-medium">{t.endDate ? new Date(t.endDate).toLocaleDateString() : 'Ongoing'}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
