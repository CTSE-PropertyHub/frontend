import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInspection } from '@/hooks/useInspections'
import { useMyProperties } from '@/hooks/useProperties'
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

  const { data: myProperties }  = useMyProperties()
  const { data: myTenancies }   = useTenancies()
  const { data: inspectors = [] } = useInspectors()
  const createInspection = useCreateInspection()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const propertyId  = watch('propertyId')
  const inspectorId = watch('inspectorId')

  // Tenants pick from their ACTIVE tenancies; Landlords/Admins pick from their own properties
  const activeTenancyProperties = myTenancies
    ?.filter(t => t.status === 'ACTIVE')
    .map(t => ({ id: t.propertyId, label: `Property ID: ${t.propertyId}` })) ?? []

  const propertyOptions = isTenant
    ? activeTenancyProperties
    : (myProperties?.map(p => ({ id: p.id, label: `${p.title} — ${p.city}` })) ?? [])

  function onSubmit(data: FormData) {
    createInspection.mutate(
      { ...data, notes: data.notes || undefined },
      { onSuccess: (i) => navigate(`/inspections/${i.id}`) }
    )
  }

  const noProperties = isTenant && activeTenancyProperties.length === 0

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">New Inspection</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspection details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Property */}
            <div className="space-y-1">
              <Label>Property</Label>
              {noProperties ? (
                <p className="text-sm text-muted-foreground">
                  You have no active tenancies. You can only request inspections for properties you are actively renting.
                </p>
              ) : (
                <Select value={propertyId} onValueChange={v => setValue('propertyId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId.message}</p>}
            </div>

            {/* Inspector */}
            <div className="space-y-1">
              <Label>Inspector</Label>
              {inspectors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No inspectors are registered yet. Ask an Admin to create inspector accounts.
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
            <div className="space-y-1">
              <Label>Scheduled date & time</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea {...register('notes')} rows={3} placeholder="Any initial notes for the inspector…" />
            </div>

            <div className="flex gap-2 pt-2">
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
