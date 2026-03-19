import { Link } from 'react-router-dom'
import { useProperties } from '@/hooks/useProperties'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'

export default function PropertyListPage() {
  const { data: properties, isLoading, isError } = useProperties()

  if (isLoading) return <p className="text-muted-foreground">Loading properties…</p>
  if (isError) return <p className="text-destructive">Failed to load properties.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Available Properties</h1>
      {properties?.length === 0 && (
        <p className="text-muted-foreground">No properties available right now.</p>
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
                {(p.bedrooms || p.bathrooms) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {p.bedrooms ? `${p.bedrooms} bed` : ''}{p.bedrooms && p.bathrooms ? ' · ' : ''}{p.bathrooms ? `${p.bathrooms} bath` : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
