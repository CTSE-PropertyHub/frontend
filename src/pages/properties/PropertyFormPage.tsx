import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProperty, useCreateProperty, useUpdateProperty } from '@/hooks/useProperties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND']),
  pricePerMonth: z.coerce.number().positive('Price must be positive'),
  bedrooms: z.coerce.number().int().positive().optional().or(z.literal('')),
  bathrooms: z.coerce.number().int().positive().optional().or(z.literal('')),
  areaSqm: z.coerce.number().positive().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function PropertyFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing } = useProperty(id ?? '')
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'APARTMENT' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description ?? '',
        address: existing.address,
        city: existing.city,
        postalCode: existing.postalCode,
        type: existing.type,
        pricePerMonth: existing.pricePerMonth,
        bedrooms: existing.bedrooms,
        bathrooms: existing.bathrooms,
        areaSqm: existing.areaSqm,
      })
    }
  }, [existing, reset])

  const type = watch('type')

  function onSubmit(data: FormData) {
    const payload = {
      ...data,
      bedrooms: data.bedrooms !== '' ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms !== '' ? Number(data.bathrooms) : undefined,
      areaSqm: data.areaSqm !== '' ? Number(data.areaSqm) : undefined,
    }
    if (isEdit) {
      updateProperty.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate(`/properties/${id}`),
      })
    } else {
      createProperty.mutate(payload, {
        onSuccess: (p) => navigate(`/properties/${p.id}`),
      })
    }
  }

  const isPending = createProperty.isPending || updateProperty.isPending

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">{isEdit ? 'Edit Property' : 'New Property'}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea {...register('description')} rows={3} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input {...register('address')} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input {...register('city')} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Postal code</Label>
                <Input {...register('postalCode')} />
                {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={type} onValueChange={v => setValue('type', v as FormData['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND'].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Monthly rent ($)</Label>
                <Input type="number" {...register('pricePerMonth')} />
                {errors.pricePerMonth && <p className="text-xs text-destructive">{errors.pricePerMonth.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Bedrooms</Label>
                <Input type="number" {...register('bedrooms')} />
              </div>
              <div className="space-y-1">
                <Label>Bathrooms</Label>
                <Input type="number" {...register('bathrooms')} />
              </div>
              <div className="space-y-1">
                <Label>Area (m²)</Label>
                <Input type="number" step="0.1" {...register('areaSqm')} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create property'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
