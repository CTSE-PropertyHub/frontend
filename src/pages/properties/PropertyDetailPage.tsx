import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProperty, useUpdatePropertyStatus, useDeleteProperty } from '@/hooks/useProperties'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import type { PropertyStatus } from '@/types/property'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: property, isLoading, isError } = useProperty(id!)
  const updateStatus = useUpdatePropertyStatus()
  const deleteProperty = useDeleteProperty()

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (isError || !property) return <p className="text-destructive text-sm">Property not found.</p>

  const canManage = user?.role === 'Admin' || user?.id === property.landlordId

  function handleDelete() {
    if (!confirm('Delete this property?')) return
    deleteProperty.mutate(property!.id, { onSuccess: () => navigate('/properties/my') })
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{property.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{property.address}, {property.city} {property.postalCode}</p>
        </div>
        <StatusBadge status={property.status} />
      </div>

      <Card className="mb-3">
        <CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{property.type.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly rent</p>
            <p className="font-semibold">${property.pricePerMonth.toLocaleString()}</p>
          </div>
          {property.bedrooms && (
            <div>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
              <p className="font-medium">{property.bedrooms}</p>
            </div>
          )}
          {property.bathrooms && (
            <div>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
              <p className="font-medium">{property.bathrooms}</p>
            </div>
          )}
          {property.areaSqm && (
            <div>
              <p className="text-xs text-muted-foreground">Area</p>
              <p className="font-medium">{property.areaSqm} m²</p>
            </div>
          )}
        </CardContent>
      </Card>

      {property.description && (
        <Card className="mb-3">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Manage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Select value={property.status} onValueChange={(v) => updateStatus.mutate({ id: property.id, status: v })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['AVAILABLE', 'RENTED', 'UNDER_MAINTENANCE'] as PropertyStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Change status</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/properties/${property.id}/edit`}>Edit</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteProperty.isPending}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
