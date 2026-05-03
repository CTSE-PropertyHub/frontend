import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInspection } from '@/hooks/useInspections'
import { useMyProperties, useProperties } from '@/hooks/useProperties'
import { useTenancies } from '@/hooks/useTenancies'
import { useInspectors } from '@/hooks/useUsers'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  propertyId:  z.string().min(1, 'Select a property'),
  inspectorId: z.string().min(1, 'Select an inspector'),
  scheduledAt: z.string().min(1, 'Schedule date/time is required'),
  notes:       z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function InspectionFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isTenant = user?.role === 'Tenant'

  const { data: allProperties = [] }   = useProperties()
  const { data: myProperties = [] }    = useMyProperties()
  const { data: myTenancies = [] }     = useTenancies()
  const { data: inspectors = [] }      = useInspectors()
  const createInspection = useCreateInspection()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const propertyId  = watch('propertyId')
  const inspectorId = watch('inspectorId')

  // Tenants: pick from properties they have an ACTIVE tenancy for
  const tenantPropertyIds = new Set(
    myTenancies.filter(t => t.status === 'ACTIVE').map(t => t.propertyId)
  )
  const tenantProperties = allProperties.filter(p => tenantPropertyIds.has(p.id))

  const propertyOptions = isTenant ? tenantProperties : myProperties
  const noProperties = isTenant && tenantProperties.length === 0

  function onSubmit(data: FormData) {
    createInspection.mutate(
      { ...data, notes: data.notes || undefined },
      { onSuccess: (i) => navigate(`/inspections/${i.id}`) }
    )
  }

  return (
    <div className="max-w-lg">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Schedule Inspection</h1>
        <p className="text-sm text-muted-foreground mt-1">Book an inspector to visit a property.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inspection details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Property */}
            <div className="space-y-1.5">
              <Label>Property</Label>
              {noProperties ? (
                <p className="text-sm text-muted-foreground rounded-md border bg-muted/40 p-3">
                  You have no active tenancies. Inspections can only be scheduled for properties you are actively renting.
                </p>
              ) : (
                <Select value={propertyId} onValueChange={v => setValue('propertyId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} — {p.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId.message}</p>}
            </div>

            {/* Inspector */}
            <div className="space-y-1.5">
              <Label>Inspector</Label>
              {inspectors.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-md border bg-muted/40 p-3">
                  No inspectors are registered. Ask an Admin to create inspector accounts.
                </p>
              ) : (
                <Select value={inspectorId} onValueChange={v => setValue('inspectorId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    {inspectors.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.firstName} {i.lastName} — {i.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.inspectorId && <p className="text-sm text-destructive">{errors.inspectorId.message}</p>}
            </div>

            {/* Scheduled date */}
            <div className="space-y-1.5">
              <Label>Scheduled date & time</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea {...register('notes')} rows={3} placeholder="Any notes for the inspector…" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={createInspection.isPending || noProperties}>
                {createInspection.isPending ? 'Scheduling…' : 'Schedule inspection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>

            {createInspection.isError && (
              <p className="text-sm text-destructive">
                Failed to schedule inspection. Ensure you have an active tenancy for this property.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
