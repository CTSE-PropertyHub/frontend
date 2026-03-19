import { useParams, useNavigate } from 'react-router-dom'
import { useTenancy, useUpdateTenancyStatus, useDeleteTenancy } from '@/hooks/useTenancies'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import type { TenancyStatus } from '@/types/tenancy'

const STATUS_OPTIONS: TenancyStatus[] = ['PENDING', 'ACTIVE', 'TERMINATED', 'EXPIRED']

export default function TenancyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: tenancy, isLoading, isError } = useTenancy(id!)
  const updateStatus = useUpdateTenancyStatus()
  const deleteTenancy = useDeleteTenancy()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError || !tenancy) return <p className="text-destructive">Tenancy not found.</p>

  const canChangeStatus =
    user?.role === 'Admin' || (user?.role === 'Landlord' && user.id === tenancy.landlordId)
  const canDelete = user?.role === 'Admin'

  function handleDelete() {
    if (!confirm('Delete this tenancy?')) return
    deleteTenancy.mutate(tenancy!.id, {
      onSuccess: () => navigate('/tenancies'),
    })
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tenancy</h1>
        <StatusBadge status={tenancy.status} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Property ID</p>
            <p className="font-mono text-xs break-all">{tenancy.propertyId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly rent</p>
            <p className="font-medium">${tenancy.monthlyRent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start date</p>
            <p className="font-medium">{new Date(tenancy.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End date</p>
            <p className="font-medium">{tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString() : 'Ongoing'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Landlord ID</p>
            <p className="font-mono text-xs break-all">{tenancy.landlordId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tenant ID</p>
            <p className="font-mono text-xs break-all">{tenancy.tenantId}</p>
          </div>
        </CardContent>
      </Card>

      {(canChangeStatus || canDelete) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canChangeStatus && (
              <div className="flex items-center gap-3">
                <Select
                  value={tenancy.status}
                  onValueChange={(v) => updateStatus.mutate({ id: tenancy.id, status: v })}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Change status</span>
              </div>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTenancy.isPending}
              >
                Delete tenancy
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
