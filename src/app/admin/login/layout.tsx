import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SISFOR Lab // Akses Admin',
  description: 'Autentikasi admin untuk SISFOR Lab',
}

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
