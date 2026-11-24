import { redirect } from 'next/navigation'
import { adminSession } from '@/lib/auth'
import { AdminDesk } from '@/components/admin-desk'

export default async function AdminPage() {
  if (!(await adminSession())) redirect('/admin/login')
  return <AdminDesk />
}
