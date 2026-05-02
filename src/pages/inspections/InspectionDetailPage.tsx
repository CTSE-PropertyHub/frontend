import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useInspection, useUpdateInspection, useUpdateInspectionStatus, useDeleteInspection } from '@/hooks/useInspections'
import { useTenancies, useUpdateTenancyStatus } from '@/hooks/useTenancies'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import PropertyTitle from '@/components/PropertyTitle'
import UserName from '@/components/UserName'
import type { InspectionStatus } from '@/types/inspection'

const STATUS_OPTIONS: InspectionStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: inspection, isLoading, isError } = useInspection(id!)
  const { data: tenancies = [] } = useTenancies()
  const updateInspection     = useUpdateInspection()
  const updateInspectionStatus = useUpdateInspectionStatus()
  const deleteInspection     = useDeleteInspection()
  const updateTenancyStatus  = useUpdateTenancyStatus()

  const { register, handleSubmit } = useForm<{ notes: string; report: string }>()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError || !inspection) return <p className="text-destructive">Inspection not found.</p>

  const canEditNotes   = user?.role === 'Admin' || (user?.role === 'Inspector' && user.id === inspection.inspectorId)
  const canChangeStatus = canEditNotes
  const canDelete      = user?.role === 'Admin'

  // Tenant: can accept/reject after inspection is COMPLETED
  const isTenantRequester = user?.role === 'Tenant' && user.id === inspection.requestedById
  const activeTenancy = tenancies.find(
    t => t.propertyId === inspection.propertyId && t.status === 'ACTIVE'
  )
  const canDecide = isTenantRequester && inspection.status === 'COMPLETED' && !!activeTenancy

  function handleDelete() {
    if (!confirm('Delete this inspection?')) return
    deleteInspection.mutate(inspection!.id, { onSuccess: () => navigate('/inspections') })
  }

  function onSaveNotes(data: { notes: string; report: string }) {
    updateInspection.mutate({ id: inspection!.id, data })
  }

  function acceptDeal() {
    updateTenancyStatus.mutate({ id: activeTenancy!.id, status: 'COMPLETED' }, {
      onSuccess: () => navigate('/tenancies'),
    })
  }

  function walkAway() {
    updateTenancyStatus.mutate({ id: activeTenancy!.id, status: 'TERMINATED' }, {
      onSuccess: () => navigate('/tenancies'),
    })
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inspection</h1>
        <StatusBadge status={inspection.status} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-muted-foreground">Property</p>
            <p className="font-medium"><PropertyTitle id={inspection.propertyId} /></p>
          </div>
          <div>
            <p className="text-muted-foreground">Scheduled</p>
            <p className="font-medium">{new Date(inspection.scheduledAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inspector</p>
            <p className="font-medium"><UserName id={inspection.inspectorId} /></p>
          </div>
          <div>
            <p className="text-muted-foreground">Requested by</p>
            <p className="font-medium"><UserName id={inspection.requestedById} /></p>
          </div>
        </CardContent>
      </Card>

      {/* Inspector / Admin: write notes and report */}
      {canEditNotes && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Notes & Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSaveNotes)} className="space-y-3">
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea {...register('notes')} defaultValue={inspection.notes ?? ''} rows={3} placeholder="Inspection notes…" />
              </div>
              <div className="space-y-1">
                <Label>Report</Label>
                <Textarea {...register('report')} defaultValue={inspection.report ?? ''} rows={5} placeholder="Final inspection report…" />
              </div>
              <Button type="submit" size="sm" disabled={updateInspection.isPending}>
                {updateInspection.isPending ? 'Saving…' : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Read-only notes/report for other roles */}
      {!canEditNotes && (inspection.notes || inspection.report) && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Inspection Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {inspection.notes && (
              <div>
                <p className="text-muted-foreground mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{inspection.notes}</p>
              </div>
            )}
            {inspection.report && (
              <div>
                <p className="text-muted-foreground mb-1">Report</p>
                <p className="whitespace-pre-wrap">{inspection.report}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tenant: accept or walk away after inspection is COMPLETED */}
      {canDecide && (
        <Card className="mb-4 border-primary">
          <CardHeader>
            <CardTitle className="text-base">Your decision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The inspection is complete. Review the report above and decide whether to proceed with this rental.
            </p>
            <div className="flex gap-3">
              <Button onClick={acceptDeal} disabled={updateTenancyStatus.isPending}>
                Accept deal
              </Button>
              <Button variant="outline" onClick={walkAway} disabled={updateTenancyStatus.isPending}>
                Walk away
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isTenantRequester && inspection.status === 'COMPLETED' && !activeTenancy && (
        <p className="text-sm text-muted-foreground mb-4">
          This inspection is complete but your tenancy is no longer active.
        </p>
      )}

      {/* Inspector / Admin: status control */}
      {(canChangeStatus || canDelete) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canChangeStatus && (
              <div className="flex items-center gap-3">
                <Select
                  value={inspection.status}
                  onValueChange={(v) => updateInspectionStatus.mutate({ id: inspection.id, status: v })}
                >
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Change status</span>
              </div>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteInspection.isPending}>
                Delete inspection
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
