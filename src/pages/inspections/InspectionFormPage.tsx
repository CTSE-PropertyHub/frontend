import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInspection } from '@/hooks/useInspections'
import { useMyProperties } from '@/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  propertyId: z.string().min(1, 'Select a property'),
  inspectorId: z.string().min(1, 'Inspector user ID is required'),
  scheduledAt: z.string().min(1, 'Schedule date/time is required'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function InspectionFormPage() {
  const navigate = useNavigate()
  const { data: myProperties } = useMyProperties()
  const createInspection = useCreateInspection()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const propertyId = watch('propertyId')

  function onSubmit(data: FormData) {
    createInspection.mutate(
      { ...data, notes: data.notes || undefined },
      { onSuccess: (i) => navigate(`/inspections/${i.id}`) }
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">New Inspection</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspection details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={v => setValue('propertyId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {myProperties?.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {p.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Inspector user ID</Label>
              <Input {...register('inspectorId')} placeholder="Paste the inspector's user ID" />
              <p className="text-xs text-muted-foreground">
                Inspector accounts are assigned by an Admin. Ask your Admin for the inspector's user ID.
              </p>
              {errors.inspectorId && <p className="text-sm text-destructive">{errors.inspectorId.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Scheduled date & time</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea {...register('notes')} rows={3} placeholder="Any initial notes for the inspector…" />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createInspection.isPending}>
                {createInspection.isPending ? 'Scheduling…' : 'Schedule inspection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
            {createInspection.isError && (
              <p className="text-sm text-destructive">Failed to create inspection. Check the inspector ID and try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
