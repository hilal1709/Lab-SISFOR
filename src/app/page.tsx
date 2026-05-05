'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ClipboardList,
  Home as HomeIcon,
} from 'lucide-react'

type GalleryItem = {
  id: string
  title: string
  imageUrl: string
  description: string | null
}

export default function HomePage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery')
        if (!response.ok) return
        const data = (await response.json()) as GalleryItem[]
        setGalleryItems(data)
      } catch (error) {
        console.error('Error fetching gallery:', error)
      }
    }

    void fetchGallery()
  }, [])

  return (
    <div className="min-h-screen bg-white w-full">
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
          <Link href="/" className="font-black uppercase tracking-tight text-black underline decoration-4 decoration-lime-400 hover:text-gray-600">
            Beranda
          </Link>
          <Link href="/schedule" className="font-black uppercase tracking-tight text-gray-500 hover:bg-lime-400 hover:text-black transition-colors px-2 py-1">
            Jadwal
          </Link>
          <Link href="/booking" className="font-black uppercase tracking-tight text-gray-500 hover:bg-lime-400 hover:text-black transition-colors px-2 py-1">
            Pemesanan
          </Link>
        </div>
      </nav>


      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 pt-28 sm:px-6 md:pt-20">
        {/* Hero Section */}
        <section className="relative mb-20 flex flex-col gap-8 overflow-hidden border-4 border-black bg-[#e6ff00] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8 md:mb-24 md:p-16">
          <div className="z-10 flex flex-col items-start gap-6 w-full lg:w-2/3">
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tighter text-black sm:text-6xl md:text-7xl">
              SISFOR LAB:<br />
              PUSAT<br />
              INOVASI
            </h1>
            
            <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6">
              <p className="text-base sm:text-lg text-black font-medium leading-relaxed">
                Pesan ruang riset terbaik untuk mendukung eksperimen modern berintensitas tinggi. Presisi kelas industri bertemu sistem penjadwalan digital yang mulus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <Link href="/booking" className="action-btn block w-full border-4 border-black bg-black px-8 py-4 text-center text-sm font-black uppercase text-[#e6ff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 sm:w-auto sm:text-base">
                PESAN LAB SEKARANG
              </Link>
              <Link href="/schedule" className="action-btn block w-full border-4 border-black bg-white px-8 py-4 text-center text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-gray-100 hover:shadow-none active:translate-x-1 active:translate-y-1 sm:w-auto sm:text-base">
                LIHAT JADWAL
              </Link>
            </div>
          </div>

          {/* Decorative Element (Desktop only) */}
          <div className="hidden md:block absolute right-8 top-8 w-1/3 h-[calc(100%-64px)] border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <Image
              src="/hima (2).png"
              alt="HIMA visual"
              fill
              className="object-contain p-2"
            />
          </div>
        </section>

        {/* Lab Gallery Section */}
        <section className="mb-20 md:mb-24">
          <h2 className="mb-8 text-3xl font-black uppercase tracking-tight text-black sm:text-5xl md:mb-12 md:text-6xl">
            GALERI LAB
          </h2>

          {galleryItems.length === 0 ? (
            <div className="border-4 border-black bg-white p-8 text-center font-bold uppercase text-gray-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)]">
              Belum ada foto galeri. Tambahkan dari halaman admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {galleryItems.map(item => (
                <article
                  key={item.id}
                  className="gallery-card border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full border-b-4 border-black bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-xl uppercase text-black">{item.title}</h3>
                    {item.description ? (
                      <p className="mt-2 text-sm text-gray-700 font-medium leading-relaxed">{item.description}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-white border-t-4 border-black pb-4">
        <Link href="/" className="flex w-20 flex-col items-center justify-center border-2 border-black bg-lime-400 p-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <HomeIcon className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="mt-1 text-xs uppercase">Beranda</span>
        </Link>
        <Link
          href="/schedule"
          className="flex w-20 flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <CalendarDays className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="mt-1 text-xs uppercase">Jadwal</span>
        </Link>
        <Link
          href="/booking"
          className="flex w-20 flex-col items-center justify-center p-2 text-black transition-colors hover:bg-gray-100"
        >
          <ClipboardList className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          <span className="mt-1 text-xs uppercase">Pemesanan</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="mt-20 mb-24 flex w-full flex-col items-center justify-between gap-6 border-t-4 border-lime-400 bg-black px-4 py-10 sm:px-8 md:mb-0 md:mt-24 md:flex-row md:py-12">
        <div className="text-lime-400 font-black uppercase text-xl">
          SISFOR
        </div>
        <div className="font-medium text-sm text-lime-400 text-center md:text-left">
          © 2026 SISFOR LAB. PUSAT INOVASI.
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href="#" className="font-medium text-sm text-white hover:text-lime-300 transition-colors">
            Bantuan
          </a>
          <a href="#" className="font-medium text-sm text-white hover:text-lime-300 transition-colors">
            Privasi
          </a>
          <a href="#" className="font-medium text-sm text-white hover:text-lime-300 transition-colors">
            Ketentuan
          </a>
        </div>
      </footer>
    </div>
  )
}
