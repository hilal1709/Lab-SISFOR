import '../globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SISFOR Lab - Sistem Pemesanan',
  description: 'Sistem pemesanan dan manajemen laboratorium',
  icons: {
    icon: '/Sitem Informasi (2) (2).png',
    shortcut: '/Sitem Informasi (2) (2).png',
    apple: '/Sitem Informasi (2) (2).png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-900 text-white antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
