'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import anime from 'animejs'
import { getLabTimeSlotLabel } from '@/lib/lab-time-slots'

type BookingStatus = 'pending' | 'approved' | 'rejected'

type Booking = {
  id: string
  fullName: string
  studentId: string
  prodi: string
  date: string
  timeSlot: string
  purpose: string
  status: BookingStatus
  createdAt: string
}

type GalleryItem = {
  id: string
  title: string
  imageUrl: string
  description: string | null
}

const statusBadge: Record<BookingStatus, string> = {
  pending: 'bg-surface-variant text-on-surface',
  approved: 'bg-primary text-white',
  rejected: 'bg-error text-white',
}

const statusText: Record<BookingStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function AdminPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryImageUrl, setGalleryImageUrl] = useState('')
  const [galleryDescription, setGalleryDescription] = useState('')
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings')
        if (!response.ok) return

        const data = (await response.json()) as Array<{
          id: string
          fullName: string
          studentId: string
          prodi: string
          date: string
          timeSlot: string
          purpose: string
          status: BookingStatus
          createdAt: string
        }>

        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    }

    void fetchBookings()
  }, [])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/admin/gallery')
        if (!response.ok) return
        const data = (await response.json()) as GalleryItem[]
        setGalleryItems(data)
      } catch (error) {
        console.error('Error fetching gallery:', error)
      }
    }

    void fetchGallery()
  }, [])

  const pendingCount = useMemo(
    () => bookings.filter(booking => booking.status === 'pending').length,
    [bookings]
  )

  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) {
      return bookings
    }

    const normalized = searchTerm.trim().toLowerCase()

    return bookings.filter(booking =>
      [
        booking.fullName,
        booking.studentId,
        booking.prodi,
        booking.purpose,
        booking.timeSlot,
        statusText[booking.status],
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  }, [bookings, searchTerm])

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        '.admin-hero',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )

      gsap.fromTo(
        '.stats-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 }
      )
    }, containerRef)

    return () => context.revert()
  }, [])

  useEffect(() => {
    anime({
      targets: '.booking-row',
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 450,
      delay: anime.stagger(60, { start: 160 }),
      easing: 'easeOutQuad',
    })

    anime({
      targets: '.action-button',
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 300,
      delay: anime.stagger(40, { start: 240 }),
      easing: 'easeOutQuad',
    })
  }, [filteredBookings.length])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (!response.ok) return

      setBookings(current =>
        current.map(booking =>
          booking.id === id ? { ...booking, status: 'approved' } : booking
        )
      )
    } catch (error) {
      console.error('Error approving booking:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) return

      setBookings(current => current.filter(booking => booking.id !== id))
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleAddGalleryItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: galleryTitle,
          imageUrl: galleryImageUrl,
          description: galleryDescription,
        }),
      })

      if (!response.ok) return
      const item = (await response.json()) as GalleryItem
      setGalleryItems(current => [item, ...current])
      setGalleryTitle('')
      setGalleryImageUrl('')
      setGalleryDescription('')
    } catch (error) {
      console.error('Error creating gallery item:', error)
    }
  }

  const handleDeleteGalleryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) return
      setGalleryItems(current => current.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting gallery item:', error)
    }
  }

  const handleUploadGalleryImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingGalleryImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) return
      const data = (await response.json()) as { url: string }
      setGalleryImageUrl(data.url)
    } catch (error) {
      console.error('Error uploading gallery image:', error)
    } finally {
      setIsUploadingGalleryImage(false)
      event.target.value = ''
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-surface text-on-surface font-space">
      <nav className="fixed top-0 bottom-0 left-0 z-40 hidden w-64 flex-col gap-4 border-r-4 border-black bg-white p-6 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] md:flex">
        <div className="mb-8">
          <span className="text-xl font-black uppercase text-black">SISFOR SYSTEM</span>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/schedule"
            className="flex items-center gap-3 p-3 text-sm font-bold uppercase text-black transition-transform hover:translate-x-1 hover:bg-zinc-100"
          >
            <span className="material-symbols-outlined">calendar_view_day</span>
            Jadwal Lab
          </Link>
        </div>
      </nav>

      <div className="flex min-h-screen flex-1 flex-col pb-24 md:ml-64 md:pb-0">
        <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-3 border-b-4 border-black bg-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="material-symbols-outlined text-2xl text-primary-container">science</span>
            <h1 className="truncate text-lg font-black uppercase tracking-tighter text-black sm:text-2xl">SISFOR LAB</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="border-2 border-black bg-white px-3 py-2 text-[11px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-error-container sm:px-4 sm:text-label-bold sm:font-label-bold"
            >
              Keluar
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-primary-container">
              <span className="text-sm font-bold text-black">AD</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin">
          <div className="mx-auto max-w-7xl">
            <div className="admin-hero mb-gutter flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-headline-lg font-headline-lg uppercase text-on-surface">
                  Dashboard Admin
                </h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">
                  Kelola dan tinjau semua pemesanan fasilitas laboratorium.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="stats-card min-w-[120px] border-border-width-standard border-black bg-surface-container-highest p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-headline-md font-headline-md text-primary">{pendingCount}</span>
                  <span className="text-label-mono font-label-mono uppercase text-on-surface-variant">
                    Menunggu
                  </span>
                </div>
                <div className="stats-card min-w-[120px] border-border-width-standard border-black bg-primary-container p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-headline-md font-headline-md text-black">{bookings.length}</span>
                  <span className="text-label-mono font-label-mono uppercase text-black">Jumlah</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border-border-width-standard border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col items-center justify-between gap-4 border-b-border-width-standard border-black bg-surface-container-high p-4 md:flex-row">
                <h3 className="text-headline-md font-headline-md uppercase text-on-surface">
                  Pemesanan Saat Ini
                </h3>
                <div className="flex w-full items-center border-2 border-black bg-white px-3 py-2 transition-all focus-within:translate-x-[-2px] focus-within:translate-y-[-2px] focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:w-auto">
                  <span className="material-symbols-outlined mr-2 text-on-surface-variant">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="Cari data..."
                    className="w-full bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none md:w-64"
                  />
                </div>
              </div>

              <div className="hidden grid-cols-12 gap-4 border-b-2 border-black bg-surface-container-low p-4 text-label-bold font-label-bold uppercase text-on-surface-variant lg:grid">
                <div className="col-span-2">Nama / NIM</div>
                <div className="col-span-2">Prodi</div>
                <div className="col-span-2">Tanggal</div>
                <div className="col-span-2">Waktu</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Aksi</div>
              </div>

              <div className="flex flex-col">
                {filteredBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className={`booking-row grid grid-cols-1 items-center gap-4 border-b-2 border-black p-4 transition-colors lg:grid-cols-12 ${
                      index % 2 === 0
                        ? 'bg-surface-container-lowest'
                        : 'bg-surface-container-low'
                    } hover:bg-surface-container-low`}
                  >
                    <div className="col-span-1 lg:col-span-2">
                      <div className="text-body-lg font-body-lg font-bold text-on-surface">
                        {booking.fullName}
                      </div>
                      <div className="text-label-mono font-label-mono text-on-surface-variant">
                        {booking.studentId}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center gap-2 lg:col-span-2">
                      <span className="material-symbols-outlined text-outline lg:hidden">school</span>
                      <span className="text-body-md font-body-md font-bold uppercase">
                        {booking.prodi}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center gap-2 lg:col-span-2">
                      <span className="material-symbols-outlined text-outline lg:hidden">calendar_today</span>
                      <span className="text-body-md font-body-md font-bold">
                        {formatDate(booking.date)}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center gap-2 lg:col-span-2">
                      <span className="material-symbols-outlined text-outline lg:hidden">schedule</span>
                      <span className="text-body-md font-body-md">
                        {getLabTimeSlotLabel(booking.timeSlot)}
                      </span>
                    </div>
                    <div className="col-span-1 lg:col-span-1">
                      <span
                        className={`inline-block border-2 border-black px-3 py-1 text-[10px] font-bold uppercase ${
                          statusBadge[booking.status]
                        }`}
                      >
                        {statusText[booking.status]}
                      </span>
                    </div>
                    <div className="col-span-1 flex flex-col gap-2 sm:flex-row lg:col-span-1 lg:justify-end">
                      {booking.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(booking.id)}
                            className="action-button flex w-full items-center justify-center gap-1 border-2 border-black bg-primary-container px-4 py-2 text-[12px] font-bold uppercase text-black transition-colors hover:bg-primary hover:text-white sm:flex-1 lg:w-auto lg:flex-none"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(booking.id)}
                            className="action-button flex w-full items-center justify-center gap-1 border-2 border-black bg-white px-4 py-2 text-[12px] font-bold uppercase text-error transition-colors hover:bg-error-container sm:flex-1 lg:w-auto lg:flex-none"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Hapus
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(booking.id)}
                          className="action-button flex w-full items-center justify-center gap-1 border-2 border-black bg-white px-4 py-2 text-[12px] font-bold uppercase text-error transition-colors hover:bg-error-container sm:flex-1 lg:w-auto lg:flex-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredBookings.length === 0 ? (
                  <div className="p-8 text-center text-body-md font-body-md text-on-surface-variant">
                    Tidak ada pemesanan yang cocok dengan pencarian Anda.
                  </div>
                ) : null}
              </div>

              <div className="flex justify-center bg-surface-container p-4">
                <button
                  type="button"
                  className="border-2 border-black bg-white px-6 py-2 text-label-bold font-label-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-primary-container"
                >
                  Muat Data Lainnya
                </button>
              </div>
            </div>

            <div className="mt-8 overflow-hidden border-border-width-standard border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-border-width-standard border-black bg-surface-container-high p-4">
                <h3 className="text-headline-md font-headline-md uppercase text-on-surface">
                  Pengelola Galeri Lab
                </h3>
              </div>

              <form
                onSubmit={handleAddGalleryItem}
                className="grid gap-4 border-b-2 border-black p-4 md:grid-cols-2 xl:grid-cols-5"
              >
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={event => setGalleryTitle(event.target.value)}
                  placeholder="Judul foto"
                  required
                  className="border-2 border-black bg-white px-3 py-2 text-sm font-medium uppercase outline-none"
                />
                <input
                  type="text"
                  value={galleryImageUrl}
                  onChange={event => setGalleryImageUrl(event.target.value)}
                  placeholder="/hima (2).png"
                  required
                  className="border-2 border-black bg-white px-3 py-2 text-sm font-medium outline-none"
                />
                <label className="flex items-center justify-center border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-zinc-100 cursor-pointer">
                  {isUploadingGalleryImage ? 'Mengunggah...' : 'Unggah Gambar'}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={handleUploadGalleryImage}
                    disabled={isUploadingGalleryImage}
                  />
                </label>
                <input
                  type="text"
                  value={galleryDescription}
                  onChange={event => setGalleryDescription(event.target.value)}
                  placeholder="Deskripsi singkat"
                  className="border-2 border-black bg-white px-3 py-2 text-sm font-medium outline-none"
                />
                <button
                  type="submit"
                  className="border-2 border-black bg-primary-container px-4 py-2 text-sm font-bold uppercase transition-colors hover:bg-primary hover:text-white md:col-span-2 xl:col-span-5"
                >
                  Tambah Foto
                </button>
              </form>

              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                {galleryItems.map(item => (
                  <article key={item.id} className="overflow-hidden border-2 border-black bg-white">
                    <div className="relative aspect-[4/3] w-full border-b-2 border-black bg-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-3">
                      <h4 className="text-sm font-bold uppercase">{item.title}</h4>
                      {item.description ? (
                        <p className="text-xs text-on-surface-variant">{item.description}</p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="w-full border-2 border-black bg-white px-3 py-2 text-xs font-bold uppercase text-error transition-colors hover:bg-error-container"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t-4 border-black bg-white px-2 md:hidden">
        <Link href="/schedule" className="flex flex-col items-center gap-1 p-2 text-black opacity-70">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[12px] font-bold uppercase">Jadwal</span>
        </Link>
      </nav>
    </div>
  )
}
