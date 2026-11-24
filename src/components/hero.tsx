'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Workstation } from './workstation'
import { Icon } from './ui/icon'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    let alive = true
    let media: ReturnType<(typeof import('gsap'))['default']['matchMedia']> | undefined
    void import('gsap').then(({ gsap }) => {
      if (!alive) return
      media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(root.current?.querySelectorAll('.hero-entry') || [], {
          y: 14,
          opacity: 0.72,
          stagger: 0.09,
          duration: 0.48,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        })
      })
    })
    return () => {
      alive = false
      media?.revert()
    }
  }, [])
  return (
    <section className="hero" ref={root}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-entry">
            Peminjaman
            <br />
            <em>Lab SISFOR.</em>
          </h1>
          <p className="hero-entry">
            Pilih sesi yang tersedia dan ajukan peminjaman laboratorium Sistem Informasi UISI.
          </p>
          <div className="actions hero-entry">
            <Link className="btn btn-brick" href="/schedule">
              Lihat jadwal <Icon name="arrow" />
            </Link>
            <Link className="text-action" href="/status">
              Cek status <Icon name="next" size={17} />
            </Link>
          </div>
        </div>
        <figure className="lab-print hero-entry">
          <div className="print-art">
            <Workstation />
          </div>
          <figcaption>
            <strong>Laboratorium Sistem Informasi</strong>
            <span>UISI · Gresik</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
