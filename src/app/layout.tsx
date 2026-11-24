import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-700.css'
import '../globals.css'
import type { Metadata } from 'next'
import { Header, Footer } from '@/components/site-shell'
import { ToastHost } from '@/components/ui/feedback'

export const metadata: Metadata = {
  title: 'Lab SISFOR · Peminjaman Laboratorium UISI',
  description:
    'Lihat jadwal, ajukan peminjaman laboratorium Sistem Informasi UISI, dan pantau status pengajuan.',
  icons: { icon: '/Sitem Informasi (2) (2).png' },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#main">
          Langsung ke konten
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  )
}
