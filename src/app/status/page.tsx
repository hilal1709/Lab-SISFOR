import { StatusLookup } from '@/components/status-lookup'
export default function Status({ searchParams }: { searchParams: { id?: string } }) {
  const id = typeof searchParams.id === 'string' ? searchParams.id.trim() : ''
  return <StatusLookup key={id} initialId={id} />
}
