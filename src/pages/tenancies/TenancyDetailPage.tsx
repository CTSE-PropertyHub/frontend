import { useParams, useNavigate } from 'react-router-dom'
import { useTenancy, useUpdateTenancyStatus, useDeleteTenancy } from '@/hooks/useTenancies'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import PropertyTitle from '@/components/PropertyTitle'
import UserName from '@/components/UserName'
import type { TenancyStatus } from '@/types/tenancy'

const ADMIN_STATUS_OPTIONS: TenancyStatus[] = ['PENDING', 'ACTIVE', 'REJECTED', 'COMPLETED', 'TERMINATED', 'EXPIRED']

export default function TenancyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: tenancy, isLoading, isError } = useTenancy(id!)
  const updateStatus = useUpdateTenancyStatus()
  const deleteTenancy = useDeleteTenancy()

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (isError || !tenancy) return <p className="text-destructive text-sm">Tenancy not found.</p>

  const isLandlordOwner = user?.role === 'Landlord' && user.id === tenancy.landlordId
  const isTenantOwner   = user?.role === 'Tenant'   && user.id === tenancy.tenantId
  const isAdmin         = user?.role === 'Admin'
  const isPending       = tenancy.status === 'PENDING'
  const isActive        = tenancy.status === 'ACTIVE'

  function handleDelete() {
    if (!confirm('Delete this tenancy?')) return
    deleteTenancy.mutate(tenancy!.id, { onSuccess: () => navigate('/tenancies') })
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">Tenancy</h1>
        <StatusBadge status={tenancy.status} />
      </div>

      {/* Details */}
      <Card className="mb-3">
        <CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Property</p>
            <p className="font-medium"><PropertyTitle id={tenancy.propertyId} /></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bid / month</p>
            <p className="font-medium">${tenancy.monthlyRent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge status={tenancy.status} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Start date</p>
            <p className="font-medium">{new Date(tenancy.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End date</p>
            <p className="font-medium">{tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString() : 'Ongoing'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Landlord</p>
            <p className="font-medium"><UserName id={tenancy.landlordId} /></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tenant</p>
            <p className="font-medium"><UserName id={tenancy.tenantId} /></p>
          </div>
        </CardContent>
      </Card>

      {/* Landlord: approve / reject */}
      {isLandlordOwner && isPending && (
        <Card className="mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Respond to bid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Approving will automatically reject all other pending bids for this property.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateStatus.mutate({ id: tenancy.id, status: 'ACTIVE' })} disabled={updateStatus.isPending}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: tenancy.id, status: 'REJECTED' })} disabled={updateStatus.isPending}>
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLandlordOwner && !isPending && (
        <p className="text-sm text-muted-foreground mb-3">
          This bid has been <strong>{tenancy.status.toLowerCase()}</strong>.
        </p>
      )}

      {/* Tenant: accept or walk away */}
      {isTenantOwner && isActive && (
        <Card className="mb-3 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your decision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Your bid was approved. Once the inspection report is ready, decide whether to proceed.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateStatus.mutate({ id: tenancy.id, status: 'COMPLETED' })} disabled={updateStatus.isPending}>
                Accept deal
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: tenancy.id, status: 'TERMINATED' })} disabled={updateStatus.isPending}>
                Walk away
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin: full control */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Admin controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Select value={tenancy.status} onValueChange={(v) => updateStatus.mutate({ id: tenancy.id, status: v })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADMIN_STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Change status</span>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTenancy.isPending}>
              Delete tenancy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
