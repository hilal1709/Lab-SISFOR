import { redirect } from 'next/navigation'
import { adminSession } from '@/lib/auth'
export const metadata = { title: 'Masuk admin · Lab SISFOR UISI' }
export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  if (await adminSession()) redirect('/admin')
  return children
}
