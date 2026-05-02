import { useProperty } from '@/hooks/useProperties'

export default function PropertyTitle({ id }: { id: string }) {
  const { data } = useProperty(id)
  if (!data) return <span className="text-muted-foreground italic text-sm">Loading…</span>
  return <span>{data.title} — {data.city}</span>
}
