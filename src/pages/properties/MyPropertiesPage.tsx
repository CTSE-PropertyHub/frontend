import { Link } from 'react-router-dom'
import { useMyProperties } from '@/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'

export default function MyPropertiesPage() {
  const { data: properties, isLoading, isError } = useMyProperties()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError) return <p className="text-destructive">Failed to load your properties.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Listings</h1>
        <Button asChild>
          <Link to="/properties/new">+ New Property</Link>
        </Button>
      </div>
      {properties?.length === 0 && (
        <p className="text-muted-foreground">You have no listings yet.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties?.map(p => (
          <Link key={p.id} to={`/properties/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
                  <StatusBadge status={p.status} />
                </div>
                <CardDescription>{p.address}, {p.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{p.type.toLowerCase()}</span>
                  <span className="font-semibold">${p.pricePerMonth.toLocaleString()}/mo</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
