import { Link } from 'react-router-dom'
import { useProperties } from '@/hooks/useProperties'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'

export default function PropertyListPage() {
  const { data: properties, isLoading, isError } = useProperties()

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading properties…</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load properties.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-5">Available Properties</h1>
      {properties?.length === 0 && (
        <p className="text-sm text-muted-foreground">No properties available right now.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {properties?.map(p => (
          <Link key={p.id} to={`/properties/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm leading-snug">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{p.address}, {p.city}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">{p.type.toLowerCase()}</span>
                  <span className="font-bold text-sm">${p.pricePerMonth.toLocaleString()}<span className="font-normal text-xs text-muted-foreground">/mo</span></span>
                </div>
                {(p.bedrooms || p.bathrooms) && (
                  <p className="text-xs text-muted-foreground mt-1">
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
