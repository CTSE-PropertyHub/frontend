import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTenancy } from '@/hooks/useTenancies'
import { useMyProperties } from '@/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  propertyId: z.string().min(1, 'Select a property'),
  tenantId: z.string().min(1, 'Tenant user ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  monthlyRent: z.coerce.number().positive('Monthly rent must be positive'),
})
type FormData = z.infer<typeof schema>

export default function TenancyFormPage() {
  const navigate = useNavigate()
  const { data: myProperties } = useMyProperties()
  const createTenancy = useCreateTenancy()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const propertyId = watch('propertyId')

  function onSubmit(data: FormData) {
    createTenancy.mutate(
      { ...data, endDate: data.endDate || undefined },
      { onSuccess: (t) => navigate(`/tenancies/${t.id}`) }
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">New Tenancy</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenancy details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={v => setValue('propertyId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select one of your properties" />
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
              <Label>Tenant user ID</Label>
              <Input {...register('tenantId')} placeholder="Paste the tenant's user ID" />
              <p className="text-xs text-muted-foreground">
                Ask the tenant to share their user ID from their dashboard profile.
              </p>
              {errors.tenantId && <p className="text-sm text-destructive">{errors.tenantId.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Monthly rent ($)</Label>
              <Input type="number" {...register('monthlyRent')} />
              {errors.monthlyRent && <p className="text-sm text-destructive">{errors.monthlyRent.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start date</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>End date <span className="text-muted-foreground">(optional)</span></Label>
                <Input type="date" {...register('endDate')} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createTenancy.isPending}>
                {createTenancy.isPending ? 'Creating…' : 'Create tenancy'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
            {createTenancy.isError && (
              <p className="text-sm text-destructive">Failed to create tenancy. Check the tenant ID and try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
