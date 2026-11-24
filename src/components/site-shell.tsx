'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Icon } from './ui/icon'
import { Button } from './ui/button'

const links = [
  ['/', 'Beranda'],
  ['/schedule', 'Jadwal'],
  ['/booking', 'Peminjaman'],
  ['/status', 'Cek status'],
] as const

export function Header() {
  const path = usePathname()
  return (
    <header className="masthead">
      <div className="mast-inner">
        <Link href="/" className="brand" aria-label="Lab SISFOR UISI, beranda">
          <Image src="/Sitem Informasi (2) (2).png" width={160} height={50} alt="" priority />
          <span>
            Lab SISFOR<small>Sistem Informasi UISI</small>
          </span>
        </Link>
        <nav aria-label="Navigasi utama">
          {links.map(([url, label]) => (
            <Link key={url} href={url} aria-current={path === url ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        {path === '/admin' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void signOut({ callbackUrl: '/admin/login' })}
          >
            <Icon name="exit" size={18} />
            Keluar
          </Button>
        ) : (
          <Link className="btn btn-paper btn-sm" href="/admin/login">
            <Icon name="lock" size={18} />
            Admin
          </Link>
        )}
      </div>
    </header>
  )
}
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <strong>Lab SISFOR</strong>
        <span>Program Studi Sistem Informasi · Universitas Internasional Semen Indonesia</span>
        <Link href="/status">
          Cek status <Icon name="arrow" size={17} />
        </Link>
      </div>
    </footer>
  )
}
