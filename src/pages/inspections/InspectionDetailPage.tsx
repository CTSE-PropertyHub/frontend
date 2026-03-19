import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useInspection, useUpdateInspection, useUpdateInspectionStatus, useDeleteInspection } from '@/hooks/useInspections'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatusBadge from '@/components/StatusBadge'
import type { InspectionStatus } from '@/types/inspection'

const STATUS_OPTIONS: InspectionStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: inspection, isLoading, isError } = useInspection(id!)
  const updateInspection = useUpdateInspection()
  const updateStatus = useUpdateInspectionStatus()
  const deleteInspection = useDeleteInspection()

  const { register, handleSubmit } = useForm<{ notes: string; report: string }>()

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>
  if (isError || !inspection) return <p className="text-destructive">Inspection not found.</p>

  const canEditNotes =
    user?.role === 'Admin' || (user?.role === 'Inspector' && user.id === inspection.inspectorId)
  const canChangeStatus = canEditNotes
  const canDelete = user?.role === 'Admin'

  function handleDelete() {
    if (!confirm('Delete this inspection?')) return
    deleteInspection.mutate(inspection!.id, {
      onSuccess: () => navigate('/inspections'),
    })
  }

  function onSaveNotes(data: { notes: string; report: string }) {
    updateInspection.mutate({ id: inspection!.id, data })
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
          <div>
            <p className="text-muted-foreground">Property ID</p>
            <p className="font-mono text-xs break-all">{inspection.propertyId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Scheduled at</p>
            <p className="font-medium">{new Date(inspection.scheduledAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inspector ID</p>
            <p className="font-mono text-xs break-all">{inspection.inspectorId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Requested by</p>
            <p className="font-mono text-xs break-all">{inspection.requestedById}</p>
          </div>
        </CardContent>
      </Card>

      {canEditNotes && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Notes & Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSaveNotes)} className="space-y-3">
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  {...register('notes')}
                  defaultValue={inspection.notes ?? ''}
                  rows={3}
                  placeholder="Inspection notes…"
                />
              </div>
              <div className="space-y-1">
                <Label>Report</Label>
                <Textarea
                  {...register('report')}
                  defaultValue={inspection.report ?? ''}
                  rows={5}
                  placeholder="Final inspection report…"
                />
              </div>
              <Button type="submit" size="sm" disabled={updateInspection.isPending}>
                {updateInspection.isPending ? 'Saving…' : 'Save notes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!canEditNotes && (inspection.notes || inspection.report) && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Notes & Report</CardTitle>
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
                  onValueChange={(v) => updateStatus.mutate({ id: inspection.id, status: v })}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
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
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteInspection.isPending}
              >
                Delete inspection
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
