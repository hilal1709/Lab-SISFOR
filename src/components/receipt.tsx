'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Receipt } from '@/lib/booking'
import { dateLabel } from '@/lib/lab-date'
import { getLabTimeSlotLabel } from '@/lib/lab-time-slots'
import { Badge } from './ui/feedback'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export async function pulse(element: HTMLElement | null) {
  if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: anime } = await import('animejs')
  if (!element.isConnected || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  anime.remove(element)
  anime({ targets: element, scale: [0.97, 1], duration: 220, easing: 'easeOutQuad' })
}

export function BookingReceipt({
  booking,
  submitted = false,
}: {
  booking: Receipt
  submitted?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const copyRef = useRef<HTMLButtonElement>(null)
  async function copy() {
    try {
      await navigator.clipboard.writeText(booking.id)
      setCopied(true)
      toast.success('ID disalin')
      void pulse(copyRef.current)
    } catch {
      toast.error('Pilih teks ID dan salin secara manual.')
    }
  }
  return (
    <article className="receipt">
      <div className="receipt-title">
        <h2>{submitted ? 'Pengajuan terkirim' : 'Status pengajuan'}</h2>
        <Badge status={booking.status} />
      </div>
      <dl className="facts">
        <div>
          <dt>Tanggal</dt>
          <dd>{dateLabel(booking.date)}</dd>
        </div>
        <div>
          <dt>Sesi lab</dt>
          <dd>
            <ul className="session-list">
              {booking.timeSlots.map((slot) => <li key={slot}>{getLabTimeSlotLabel(slot)} WIB</li>)}
            </ul>
          </dd>
        </div>
        <div>
          <dt>ID peminjaman</dt>
          <dd>
            <code>{booking.id}</code>
          </dd>
        </div>
      </dl>
      <div className="actions">
        <Button ref={copyRef} variant="outline" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} animate={copied} />
          {copied ? 'Tersalin' : 'Salin ID'}
        </Button>
        {submitted && (
          <Link href={'/status?id=' + encodeURIComponent(booking.id)} className="btn btn-brick">
            Cek status <Icon name="arrow" />
          </Link>
        )}
      </div>
    </article>
  )
}
