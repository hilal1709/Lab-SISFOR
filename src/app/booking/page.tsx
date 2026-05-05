'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, Clock3, Loader2, BookOpenText } from 'lucide-react'
import {
  getLabTimeSlotLabel,
  LAB_TIME_SLOT_OPTIONS,
  resolveLabTimeSlotFromQuery,
} from '@/lib/lab-time-slots'

type BookingFormState = {
  fullName: string
  studentId: string
  date: string
  timeSlot: string
  purpose: string
}

type BookingRecord = BookingFormState & {
  id: string
  status: string
  createdAt: string
  updatedAt?: string
}

const bookingStatusText: Record<string, string> = {
  pending: 'MENUNGGU',
  approved: 'DISETUJUI',
  rejected: 'DITOLAK',
}

function getDateLabel(dateValue: string) {
  if (!dateValue) return '-'

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isBookingDateParam(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const t = new Date(`${value}T12:00:00`).getTime()
  return !Number.isNaN(t)
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingPageContent />
    </Suspense>
  )
}

function BookingPageFallback() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-2xl gap-6 border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
        <div className="h-6 w-32 bg-black/10" />
        <div className="h-12 w-3/4 bg-black/10" />
        <div className="h-4 w-full bg-black/5" />
        <div className="space-y-4">
          <div className="h-12 w-full border-[4px] border-black bg-black/5" />
          <div className="h-12 w-full border-[4px] border-black bg-black/5" />
          <div className="h-12 w-full border-[4px] border-black bg-black/5" />
          <div className="h-32 w-full border-[4px] border-black bg-black/5" />
        </div>
      </div>
    </div>
  )
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const urlDateParam = searchParams.get('date')
  const urlTimeParam = searchParams.get('time')

  const [formData, setFormData] = useState<BookingFormState>(() => {
    const date =
      urlDateParam && isBookingDateParam(urlDateParam.trim())
        ? urlDateParam.trim()
        : new Date().toISOString().slice(0, 10)
    const timeSlot = resolveLabTimeSlotFromQuery(urlTimeParam)
    return {
      fullName: '',
      studentId: '',
      date,
      timeSlot,
      purpose: '',
    }
  })
  const [submittedBooking, setSubmittedBooking] = useState<BookingRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const successRef = useRef<HTMLDivElement>(null)

  const selectedDateLabel = useMemo(() => getDateLabel(formData.date), [formData.date])

  // Sync date / time slot from URL when coming from schedule (or when query updates).
  // useSearchParams can be empty on the first paint; useState only runs once, so we need this effect.
  useEffect(() => {
    if (submittedBooking) {
      return
    }

    const dateFromUrl = urlDateParam?.trim() ?? ''
    const timeFromUrl = resolveLabTimeSlotFromQuery(urlTimeParam)

    setFormData(prev => ({
      ...prev,
      ...(isBookingDateParam(dateFromUrl) ? { date: dateFromUrl } : {}),
      ...(timeFromUrl ? { timeSlot: timeFromUrl } : {}),
    }))
  }, [urlDateParam, urlTimeParam, submittedBooking])

  useEffect(() => {
    if (!submittedBooking || !successRef.current) {
      return
    }
    successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [submittedBooking])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        let message = 'Gagal mengirim pemesanan'
        try {
          const payload = (await response.json()) as { error?: string }
          if (payload?.error) {
            message = payload.error
          }
        } catch {
          // Keep default message if response is not JSON.
        }
        throw new Error(message)
      }

      const booking = (await response.json()) as BookingRecord
      setSubmittedBooking(booking)
    } catch (error) {
      console.error('Error submitting booking:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Pengiriman pemesanan gagal. Silakan coba lagi.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmittedBooking(null)
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-black">
      <main className="flex min-h-screen flex-col md:flex-row">
        <section className="flex flex-1 items-center justify-center bg-[url('https://placehold.co/1920x1080/f9f9f9/dadada?text=Subtle+Grid')] bg-[length:32px_32px] bg-repeat px-4 py-8 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="w-full max-w-2xl border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8 lg:p-10">
            <div className="flex items-end justify-between gap-4 border-b-[4px] border-black pb-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
                  <BookOpenText className="h-4 w-4" /> SISFOR
                </div>
                <h1 className="mt-3 text-3xl font-bold uppercase leading-[1.08] tracking-[-0.02em] sm:text-4xl md:text-5xl lg:text-[4rem]">
                  Pemesanan Baru
                </h1>
                <p className="mt-3 text-sm font-medium text-[#444933] md:text-base">
                  Amankan jadwal penggunaan lab Anda sekarang.
                </p>
              </div>
              <div className="hidden border-[2px] border-black bg-[#ccff00] px-3 py-1 md:block">
                <span className="text-sm font-bold uppercase tracking-[0.12em]">SISFOR LAB</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="floating-chip border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Tanggal</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4" /> {selectedDateLabel}
                </div>
              </div>
              <div className="floating-chip border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Sesi</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <Clock3 className="h-4 w-4" />{' '}
                  {formData.timeSlot ? getLabTimeSlotLabel(formData.timeSlot) : 'PILIH SESI'}
                </div>
              </div>
              <div className="floating-chip border-[4px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Status</div>
                <div className="mt-2 text-sm font-semibold uppercase">Menunggu</div>
              </div>
            </div>

            <div className="mt-6 rounded-none border-[4px] border-black bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Alur</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="border-[4px] border-black bg-[#f3f3f3] p-4">
                  <div className="text-sm font-bold uppercase">1. Isi formulir</div>
                  <p className="mt-2 text-sm leading-6">Isi identitas dan detail pemesanan Anda.</p>
                </div>
                <div className="border-[4px] border-black bg-[#f3f3f3] p-4">
                  <div className="text-sm font-bold uppercase">2. Kirim</div>
                  <p className="mt-2 text-sm leading-6">Pemesanan akan disimpan dengan status menunggu tinjauan.</p>
                </div>
                <div className="border-[4px] border-black bg-[#f3f3f3] p-4">
                  <div className="text-sm font-bold uppercase">3. Tinjau</div>
                  <p className="mt-2 text-sm leading-6">Admin dapat menyetujui atau menolak permintaan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-8 pb-32 md:px-8 md:py-8 md:pb-8">
          {!submittedBooking ? (
            <div className="w-full max-w-2xl border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8 lg:p-10">
              <div className="border-b-[4px] border-black pb-4">
                <div className="text-sm font-bold uppercase tracking-[0.18em]">Formulir</div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <h2 className="text-3xl font-bold uppercase tracking-[-0.02em] md:text-4xl">Detail Pemesanan</h2>
                  <div className="border-[2px] border-black bg-[#ccff00] px-3 py-1 text-sm font-bold uppercase">SISFOR LAB</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
                <div className="booking-field flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                    Nama Lengkap
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="JANE DOE"
                    className="w-full border-[4px] border-black bg-white p-3 text-base font-medium uppercase outline-none transition-all placeholder:text-black/35 focus:bg-[#ccff00]/10"
                  />
                </div>

                <div className="booking-field flex flex-col gap-2">
                  <label htmlFor="studentId" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                    NIM
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    placeholder="S-12345678"
                    className="w-full border-[4px] border-black bg-white p-3 text-base font-medium uppercase outline-none transition-all placeholder:text-black/35 focus:bg-[#ccff00]/10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="booking-field flex flex-col gap-2">
                    <label htmlFor="date" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                      Tanggal
                    </label>
                    <div className="relative">
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full border-[4px] border-black bg-white p-3 pr-10 text-base font-medium outline-none transition-all focus:bg-[#ccff00]/10"
                      />
                      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                    </div>
                  </div>

                  <div className="booking-field flex flex-col gap-2">
                    <label htmlFor="timeSlot" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                      Sesi Waktu
                    </label>
                    <div className="relative">
                      <select
                        id="timeSlot"
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        required
                        className="w-full cursor-pointer appearance-none border-[4px] border-black bg-white p-3 pr-10 text-base font-medium outline-none transition-all focus:bg-[#ccff00]/10"
                      >
                        <option value="">PILIH SESI</option>
                        {LAB_TIME_SLOT_OPTIONS.map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                    </div>
                  </div>
                </div>

                <div className="booking-field flex flex-col gap-2">
                  <label htmlFor="purpose" className="text-sm font-bold uppercase tracking-[0.14em] text-black">
                    Tujuan Penggunaan
                  </label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="JELASKAN KEBUTUHAN EKSPERIMEN ATAU RISET ANDA..."
                    className="w-full resize-none border-[4px] border-black bg-white p-3 text-base font-medium uppercase outline-none transition-all placeholder:text-black/35 focus:bg-[#ccff00]/10"
                  />
                </div>

                <div className="mt-2 flex flex-col-reverse gap-4 border-t-[4px] border-black pt-4 md:flex-row md:justify-end">
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center border-[4px] border-black bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:w-auto"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center border-[4px] border-black bg-[#ccff00] px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim
                      </>
                    ) : (
                      'Kirim Pemesanan'
                    )}
                  </button>
                </div>

                {errorMessage ? (
                  <div className="border-[4px] border-black bg-[#ffdad6] p-3 text-sm font-medium uppercase">
                    {errorMessage}
                  </div>
                ) : null}
              </form>
            </div>
          ) : (
            <div ref={successRef} className="w-full max-w-2xl border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8 lg:p-10">
              <div className="border-b-[4px] border-black pb-4">
                <div className="text-sm font-bold uppercase tracking-[0.18em]">Berhasil</div>
                <h2 className="mt-3 text-3xl font-bold uppercase tracking-[-0.02em] md:text-4xl">Pemesanan Terkirim</h2>
              </div>

              <div className="success-item mt-6 border-[4px] border-black bg-[#f3f3f3] p-4">
                <p className="text-sm font-medium leading-7">
                  Permintaan pemesanan Anda berhasil dikirim. Admin akan meninjau dan menyetujui permintaan Anda.
                </p>
              </div>

              <div className="success-item mt-6 grid gap-4 border-[4px] border-black bg-white p-4 md:grid-cols-2">
                <div className="break-all">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Tanggal</div>
                  <div className="mt-2 text-lg font-bold uppercase">{selectedDateLabel}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Waktu</div>
                  <div className="mt-2 text-lg font-bold uppercase">
                    {submittedBooking.timeSlot ? getLabTimeSlotLabel(submittedBooking.timeSlot) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">ID Pemesanan</div>
                  <div className="mt-2 text-lg font-bold uppercase">{submittedBooking.id}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#444933]">Status</div>
                  <div className="mt-2 text-lg font-bold uppercase">
                    {bookingStatusText[submittedBooking.status] ?? submittedBooking.status}
                  </div>
                </div>
              </div>

              <div className="success-item mt-6 flex flex-col gap-4 md:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex w-full items-center justify-center border-[4px] border-black bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] md:w-auto"
                >
                  Buat pemesanan lagi
                </button>
                <Link
                  href="/schedule"
                  className="inline-flex w-full items-center justify-center border-[4px] border-black bg-[#ccff00] px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] md:w-auto"
                >
                  Kembali ke jadwal
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
