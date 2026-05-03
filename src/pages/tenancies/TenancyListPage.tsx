import { Link } from 'react-router-dom'
import { useTenancies } from '@/hooks/useTenancies'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import PropertyTitle from '@/components/PropertyTitle'

export default function TenancyListPage() {
  const { user } = useAuth()
  const { data: tenancies, isLoading, isError } = useTenancies()

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load tenancies.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">
          {user?.role === 'Landlord' ? 'Rental Bids' : 'My Tenancies'}
        </h1>
        {user?.role === 'Tenant' && (
          <Button asChild size="sm">
            <Link to="/tenancies/new">+ Place a Bid</Link>
          </Button>
        )}
      </div>

      {tenancies?.length === 0 && (
        <p className="text-sm text-muted-foreground">No tenancies found.</p>
      )}

      <div className="space-y-2">
        {tenancies?.map(t => (
          <Link key={t.id} to={`/tenancies/${t.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate"><PropertyTitle id={t.propertyId} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ${t.monthlyRent.toLocaleString()}/mo · {new Date(t.startDate).toLocaleDateString()}
                      {t.endDate ? ` – ${new Date(t.endDate).toLocaleDateString()}` : ' (ongoing)'}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
