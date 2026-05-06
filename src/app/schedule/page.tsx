'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LAB_TIME_SLOT_VALUES } from '@/lib/lab-time-slots'
import { Beaker, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Home } from 'lucide-react'

interface Booking {
  id?: string
  date: string
  timeSlot: string
  fullName?: string
  purpose?: string
  status?: string
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, Booking | undefined>>({})

  // Fetch bookings for selected date
  useEffect(() => {
    const controller = new AbortController()

    const fetchBookings = async () => {
      try {
        const dateStr = currentDate.toISOString().slice(0, 10)
        const response = await fetch(`/api/bookings?date=${dateStr}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (response.ok) {
          const data = (await response.json()) as Booking[]
          // Only consider bookings that are not rejected
          const activeBookings = data.filter(b => b.status !== 'rejected')
          const map: Record<string, Booking> = {}
          for (const b of activeBookings) {
            // If multiple bookings somehow exist for the same slot, keep the first
            if (!map[b.timeSlot]) map[b.timeSlot] = b
          }
          setBookedSlotsMap(map)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching bookings:', error)
        }
      }
    }

    void fetchBookings()

    return () => controller.abort()
  }, [currentDate])

  const bookedSlotSet = useMemo(() => new Set(Object.keys(bookedSlotsMap)), [bookedSlotsMap])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase()
  }

  const handlePrevDate = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDate = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const formatDateForQuery = (date: Date): string => {
    return date.toISOString().slice(0, 10)
  }

  return (
    <div className="min-h-screen bg-white w-full flex flex-col">
      {/* Desktop Header */}
      <nav className="hidden md:flex justify-between items-center w-full px-6 py-4 bg-white border-b-4 border-black fixed top-0 z-50">
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
          <Link href="/" className="font-black uppercase tracking-tight text-gray-500 hover:bg-lime-400 hover:text-black transition-colors px-2 py-1">
            Beranda
          </Link>
          <Link href="/schedule" className="font-black uppercase tracking-tight text-black underline decoration-4 decoration-lime-400">
            Jadwal
          </Link>
          <Link href="/booking" className="font-black uppercase tracking-tight text-gray-500 hover:bg-lime-400 hover:text-black transition-colors px-2 py-1">
            Pemesanan
          </Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b-4 border-black flex justify-between items-center px-6 py-4">
        <button
          type="button"
          className="rounded border-2 border-black p-2 transition-colors hover:bg-lime-400 hover:text-black"
          aria-label="Menu"
        >
          <Beaker className="h-7 w-7 text-black" strokeWidth={2.25} />
        </button>
        <Image
          src="/sitem informasi(2).png"
          alt="SISFOR logo"
          width={180}
          height={50}
          className="h-9 w-auto"
          priority
        />
        <div className="h-11 w-11" aria-hidden />
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl flex-grow px-4 pb-32 pt-6 sm:px-6 md:pt-28">
        {/* Date Header */}
        <div className="mb-8 flex items-center justify-between gap-2 border-b-4 border-black pb-5 md:mb-12 md:gap-4 md:pb-6">
          <button
            onClick={handlePrevDate}
            className="w-12 h-12 flex items-center justify-center border-4 border-black bg-[#ccff00] text-black hover:bg-[#b8e600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all font-bold text-lg"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-6 w-6 text-black" strokeWidth={3} />
          </button>
          <h1 className="flex-1 px-2 text-center text-xl font-black uppercase tracking-tight text-black sm:text-2xl md:text-4xl">
            {formatDate(currentDate)}
          </h1>
          <button
            onClick={handleNextDate}
            className="w-12 h-12 flex items-center justify-center border-4 border-black bg-[#ccff00] text-black hover:bg-[#b8e600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all font-bold text-lg"
            aria-label="Next date"
          >
            <ChevronRight className="h-6 w-6 text-black" strokeWidth={3} />
          </button>
        </div>

        {/* Schedule Grid */}
        <div className="flex flex-col gap-4">
          {LAB_TIME_SLOT_VALUES.map((slot) => {
            const isBooked = bookedSlotSet.has(slot)
            const booking = bookedSlotsMap[slot]
            const dateStr = formatDateForQuery(currentDate)

            return (
              <div
                key={slot}
                className={`time-slot relative group ${isBooked ? 'opacity-50 grayscale' : 'cursor-pointer'}`}
              >
                <Link
                  href={
                    !isBooked
                      ? `/booking?date=${dateStr}&time=${encodeURIComponent(slot)}`
                      : '#'
                  }
                  className={`flex w-full flex-col items-start gap-3 border-4 border-black p-4 transition-all duration-100 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6 ${
                    isBooked
                      ? 'bg-gray-200 pointer-events-none'
                      : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`text-xl font-black tracking-tight sm:text-2xl md:text-3xl ${isBooked ? 'line-through text-gray-600' : 'text-black'}`}>
                      {slot}
                    </span>
                    {isBooked && booking ? (
                      <div className="mt-2 text-sm text-gray-700 truncate">
                        <span className="font-bold">{booking.fullName}</span>
                        <span className="mx-2">—</span>
                        <span className="">{booking.purpose}</span>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={`w-full border-2 border-black px-4 py-2 text-center sm:w-auto ${
                      isBooked
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-[#ccff00] text-black'
                    }`}
                  >
                    <span className="font-black text-sm uppercase tracking-wider">
                      {isBooked ? 'TERPESAN' : 'TERSEDIA'}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-white border-t-4 border-black">
        <Link
          href="/"
          className="flex h-full w-full flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <Home className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Beranda</span>
        </Link>
        <div className="flex h-full w-full flex-col items-center justify-center border-x-4 border-black bg-[#ccff00] p-2 text-black shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,1)]">
          <CalendarDays className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Jadwal</span>
        </div>
        <Link
          href="/booking"
          className="flex h-full w-full flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <ClipboardList className="mb-1 h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="font-black text-xs uppercase">Pemesanan</span>
        </Link>
      </nav>
    </div>
  )
}
