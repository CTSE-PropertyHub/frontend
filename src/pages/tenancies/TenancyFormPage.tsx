import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTenancy } from '@/hooks/useTenancies'
import { useProperties } from '@/hooks/useProperties'
import type { Property } from '@/types/property'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  propertyId:  z.string().min(1, 'Select a property'),
  monthlyRent: z.coerce.number().positive('Bid amount must be positive'),
  startDate:   z.string().min(1, 'Start date is required'),
  endDate:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function TenancyFormPage() {
  const navigate = useNavigate()
  const { data: properties = [] } = useProperties()
  const createTenancy = useCreateTenancy()

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const propertyId = watch('propertyId')

  function handlePropertyChange(id: string) {
    const p = properties.find(p => p.id === id) ?? null
    setValue('propertyId', id)
    setValue('monthlyRent', p?.pricePerMonth ?? 0)
    setSelectedProperty(p)
  }

  function onSubmit(data: FormData) {
    createTenancy.mutate(
      { ...data, endDate: data.endDate || undefined },
      { onSuccess: (t) => navigate(`/tenancies/${t.id}`) }
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Place a Rental Bid</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Select a property and submit your bid. The landlord will review all bids and approve one.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bid details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-1">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an available property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {p.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyId && <p className="text-sm text-destructive">{errors.propertyId.message}</p>}
            </div>

            {selectedProperty && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{selectedProperty.address}, {selectedProperty.city}</p>
                <p className="text-muted-foreground mt-1">Listed price</p>
                <p className="font-medium">${selectedProperty.pricePerMonth.toLocaleString()} / month</p>
              </div>
            )}

            <div className="space-y-1">
              <Label>Your bid ($ / month)</Label>
              <Input type="number" {...register('monthlyRent')} placeholder="Enter your offer" />
              <p className="text-xs text-muted-foreground">
                You may bid lower or higher than the listed price.
              </p>
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

            <p className="text-xs text-muted-foreground">
              Your bid will appear as <strong>PENDING</strong> until the landlord responds.
              If approved, an inspection will be scheduled before the deal is finalised.
            </p>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createTenancy.isPending}>
                {createTenancy.isPending ? 'Submitting…' : 'Submit bid'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
            {createTenancy.isError && (
              <p className="text-sm text-destructive">Failed to submit bid. Please try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
