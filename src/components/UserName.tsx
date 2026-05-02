import { useUser } from '@/hooks/useUsers'

export default function UserName({ id }: { id: string }) {
  const { data } = useUser(id)
  if (!data) return <span className="text-muted-foreground italic text-sm">Loading…</span>
  return <span>{data.firstName} {data.lastName}</span>
}
