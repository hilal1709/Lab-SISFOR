'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ClipboardList, Home as HomeIcon, Search, Clock3, CheckCircle2, XCircle } from 'lucide-react'
import { getLabTimeSlotLabel } from '@/lib/lab-time-slots'

type BookingStatus = 'pending' | 'approved' | 'rejected'

type BookingRecord = {
  id: string
  fullName: string
  studentId: string
  prodi: string
  date: string
  timeSlot: string
  purpose: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

const statusLabel: Record<BookingStatus, string> = {
  pending: 'MENUNGGU',
  approved: 'DISETUJUI',
  rejected: 'DITOLAK',
}

const statusStyle: Record<BookingStatus, string> = {
  pending: 'bg-[#fff4cc] text-black border-black',
  approved: 'bg-[#ccff00] text-black border-black',
  rejected: 'bg-[#ffd6d1] text-black border-black',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function StatusPage() {
  return (
    <Suspense fallback={<StatusPageFallback />}>
      <StatusPageContent />
    </Suspense>
  )
}

function StatusPageFallback() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-3xl gap-6 border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
        <div className="h-6 w-40 bg-black/10" />
        <div className="h-12 w-full border-[4px] border-black bg-black/5" />
        <div className="h-12 w-44 border-[4px] border-black bg-black/5" />
      </div>
    </div>
  )
}

function StatusPageContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')?.trim() ?? ''

  const [bookingId, setBookingId] = useState(initialId)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [booking, setBooking] = useState<BookingRecord | null>(null)

  const statusIcon = useMemo(() => {
    if (!booking) return null
    if (booking.status === 'approved') return <CheckCircle2 className="h-5 w-5" aria-hidden />
    if (booking.status === 'rejected') return <XCircle className="h-5 w-5" aria-hidden />
    return <Clock3 className="h-5 w-5" aria-hidden />
  }, [booking])

  const handleCheckStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setBooking(null)

    const normalizedId = bookingId.trim()
    if (!normalizedId) {
      setErrorMessage('Masukkan ID pemesanan terlebih dahulu.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(normalizedId)}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage('ID pemesanan tidak ditemukan.')
          return
        }
        throw new Error('Gagal memeriksa status pemesanan.')
      }

      const data = (await response.json()) as BookingRecord
      setBooking(data)
    } catch (error) {
      console.error('Error checking booking status:', error)
      setErrorMessage('Terjadi kesalahan saat memeriksa status. Coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-black">
      <nav className="fixed top-0 z-50 hidden w-full items-center justify-between border-b-4 border-black bg-white px-6 py-4 md:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/sitem informasi(2).png"
            alt="SISFOR logo"
            width={280}
            height={78}
            className="h-12 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-8">
          <Link href="/" className="px-2 py-1 font-black uppercase tracking-tight text-gray-500 transition-colors hover:bg-lime-400 hover:text-black">
            Beranda
          </Link>
          <Link href="/schedule" className="px-2 py-1 font-black uppercase tracking-tight text-gray-500 transition-colors hover:bg-lime-400 hover:text-black">
            Jadwal
          </Link>
          <Link href="/booking" className="px-2 py-1 font-black uppercase tracking-tight text-gray-500 transition-colors hover:bg-lime-400 hover:text-black">
            Pemesanan
          </Link>
          <Link href="/status" className="font-black uppercase tracking-tight text-black underline decoration-4 decoration-lime-400">
            Cek Status
          </Link>
        </div>
      </nav>

      <header className="sticky top-0 z-40 flex items-center justify-center border-b-4 border-black bg-white px-6 py-4 md:hidden">
        <Image
          src="/sitem informasi(2).png"
          alt="SISFOR logo"
          width={180}
          height={50}
          className="h-9 w-auto"
          priority
        />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-8 sm:px-6 md:pt-28">
        <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
          <div className="border-b-4 border-black pb-5">
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#ccff00] px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
              <Search className="h-4 w-4" />
              Portal Status
            </div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
              Cek Status Pemesanan
            </h1>
            <p className="mt-3 text-sm font-medium text-[#444933] md:text-base">
              Masukkan ID pemesanan untuk melihat apakah permintaan Anda disetujui, ditolak, atau masih menunggu.
            </p>
          </div>

          <form onSubmit={handleCheckStatus} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="booking-field flex flex-col gap-2">
              <label htmlFor="bookingId" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                ID Pemesanan
              </label>
              <input
                id="bookingId"
                name="bookingId"
                value={bookingId}
                onChange={event => setBookingId(event.target.value)}
                placeholder="cth: cm9m8k0u40001tjg4p2f8wxyz"
                className="w-full border-[4px] border-black bg-white p-3 text-base font-medium outline-none transition-all placeholder:text-black/35 focus:bg-[#ccff00]/10"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[56px] items-center justify-center border-[4px] border-black bg-[#ccff00] px-7 py-3 text-sm font-black uppercase tracking-[0.12em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Memeriksa...' : 'Cek Sekarang'}
            </button>
          </form>

          {errorMessage ? (
            <div className="mt-5 border-[4px] border-black bg-[#ffd6d1] p-3 text-sm font-bold uppercase">
              {errorMessage}
            </div>
          ) : null}

          {booking ? (
            <div className="mt-6 grid gap-4">
              <div className="flex flex-col items-start justify-between gap-4 border-[4px] border-black bg-[#f3f3f3] p-4 md:flex-row md:items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Status Saat Ini</div>
                  <div className="mt-2 text-2xl font-black uppercase">{statusLabel[booking.status]}</div>
                </div>
                <div className={`inline-flex items-center gap-2 border-[3px] px-4 py-2 text-sm font-black uppercase ${statusStyle[booking.status]}`}>
                  {statusIcon}
                  {statusLabel[booking.status]}
                </div>
              </div>

              <div className="grid gap-4 border-[4px] border-black bg-white p-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Nama</div>
                  <div className="mt-2 text-base font-bold uppercase">{booking.fullName}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">NIM</div>
                  <div className="mt-2 text-base font-bold uppercase">{booking.studentId}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Tanggal</div>
                  <div className="mt-2 text-base font-bold uppercase">{formatDate(booking.date)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Sesi</div>
                  <div className="mt-2 text-base font-bold uppercase">{getLabTimeSlotLabel(booking.timeSlot)}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Tujuan</div>
                  <div className="mt-2 text-base font-medium">{booking.purpose}</div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t-4 border-black bg-white md:hidden">
        <Link
          href="/"
          className="flex h-full w-full flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <HomeIcon className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Beranda</span>
        </Link>
        <Link
          href="/schedule"
          className="flex h-full w-full flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <CalendarDays className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Jadwal</span>
        </Link>
        <Link
          href="/booking"
          className="flex h-full w-full flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <ClipboardList className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Pemesanan</span>
        </Link>
        <div className="flex h-full w-full flex-col items-center justify-center border-l-4 border-black bg-[#ccff00] p-2 text-black shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,1)]">
          <Search className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Status</span>
        </div>
      </nav>
    </div>
  )
}
