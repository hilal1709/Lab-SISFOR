'use client'
import Link from 'next/link'
import { useState } from 'react'
import { LAB_TIME_SLOT_OPTIONS } from '@/lib/lab-time-slots'
import { dateLabel, shiftDate, validDate } from '@/lib/lab-date'
import { useRemote } from '@/lib/client-data'
import { Button } from './ui/button'
import { Banner } from './ui/feedback'
import { Icon } from './ui/icon'

export function ScheduleBoard({
  initialDate,
  compact = false,
}: {
  initialDate: string
  compact?: boolean
}) {
  const [date, setDate] = useState(initialDate)
  const slots = useRemote<{ timeSlot: string }[]>('/api/bookings?date=' + date)
  const occupied = new Set(slots.data?.map((row) => row.timeSlot))
  const visible = compact ? LAB_TIME_SLOT_OPTIONS.slice(0, 4) : LAB_TIME_SLOT_OPTIONS
  const Heading = compact ? 'h2' : 'h1'
  return (
    <section aria-label="Jadwal laboratorium" className="board-section">
      <div className="section-head">
        <div>
          <Heading>{compact ? 'Jadwal hari ini' : 'Jadwal lab'}</Heading>
          <p>
            {dateLabel(date)} <span className="mid-dot">·</span> WIB
          </p>
        </div>
        {compact ? (
          <Link className="text-action" href="/schedule">
            Semua sesi <Icon name="arrow" />
          </Link>
        ) : (
          <div className="date-controls">
            <Button
              size="icon"
              variant="outline"
              aria-label="Hari sebelumnya"
              onClick={() => setDate(shiftDate(date, -1))}
            >
              <Icon name="prev" />
            </Button>
            <input
              className="field"
              aria-label="Pilih tanggal jadwal"
              type="date"
              value={date}
              onChange={(e) => {
                if (validDate(e.target.value)) setDate(e.target.value)
              }}
            />
            <Button
              size="icon"
              variant="outline"
              aria-label="Hari berikutnya"
              onClick={() => setDate(shiftDate(date, 1))}
            >
              <Icon name="next" />
            </Button>
          </div>
        )}
      </div>
      {slots.error ? (
        <Banner retry={slots.retry}>Jadwal belum bisa dimuat.</Banner>
      ) : (
        <div className={'board ' + (compact ? 'board-compact' : '')} aria-busy={slots.loading}>
          {visible.map((slot) => {
            const taken = occupied.has(slot.value)
            const inner = (
              <>
                <span className="slot-time">{slot.label}</span>
                {slots.loading ? (
                  <span className="slot-placeholder" aria-label="Memuat sesi" />
                ) : (
                  <span className="slot-state">
                    <i className={taken ? 'occupied' : ''} />
                    {taken ? 'Terisi' : 'Tersedia'}
                  </span>
                )}
                {!slots.loading && !taken && (
                  <span className="slot-arrow">
                    <Icon name="arrow" size={20} />
                  </span>
                )}
              </>
            )
            return slots.loading || taken ? (
              <div key={slot.value} className={'slot ' + (taken ? 'taken' : '')}>
                {inner}
              </div>
            ) : (
              <Link
                key={slot.value}
                className="slot open"
                href={'/booking?date=' + date + '&time=' + encodeURIComponent(slot.value)}
                aria-label={'Pinjam sesi ' + slot.label}
              >
                {inner}
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
