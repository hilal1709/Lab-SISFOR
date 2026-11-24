'use client'
import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { BOOKING_ATTACHMENT_LIMIT, borrowerLabels, type BorrowerType, type Receipt } from '@/lib/booking'
import { dateLabel } from '@/lib/lab-date'
import { LAB_TIME_SLOT_OPTIONS } from '@/lib/lab-time-slots'
import { useRemote, requestJson } from '@/lib/client-data'
import { Icon } from './ui/icon'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Banner } from './ui/feedback'
import { BookingReceipt, pulse } from './receipt'

const programs = [
  'Akuntansi',
  'Manajemen Bisnis Islam',
  'Manajemen',
  'Manajemen Rekayasa',
  'Teknik Logistik',
  'Teknik Kimia',
  'Teknologi Agroindustri',
  'Desain Komunikasi Visual',
  'Informatika',
  'Sistem Informasi',
]

export function BookingForm({
  initialDate,
  initialTime,
}: {
  initialDate: string
  initialTime: string
}) {
  const [date, setDate] = useState(initialDate),
    [times, setTimes] = useState(initialTime ? [initialTime] : []),
    [borrowerType, setBorrowerType] = useState<BorrowerType | ''>('')
  const [booking, setBooking] = useState<Receipt>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const summary = useRef<HTMLDivElement>(null)
  const slots = useRemote<{ timeSlot: string }[]>(
    date && !booking ? '/api/bookings?date=' + date : null,
  )
  const occupied = new Set(slots.data?.map((row) => row.timeSlot))
  const selected = LAB_TIME_SLOT_OPTIONS.filter((slot) => times.includes(slot.value))
  const conflicting = selected.filter((slot) => occupied.has(slot.value))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || slots.loading || slots.error || conflicting.length) return
    if (!selected.length) {
      setError('Pilih minimal satu sesi yang tersedia.')
      return
    }
    const data = new FormData(event.currentTarget)
    for (const [field, label] of [['ktm', 'Foto KTM'], ['korin', 'Surat Korin']]) {
      const file = data.get(field)
      if (file instanceof File && file.size > BOOKING_ATTACHMENT_LIMIT) {
        setError(`Ukuran ${label} maksimal 2 MB.`)
        return
      }
    }
    setBusy(true)
    setError('')
    try {
      const receipt = await requestJson<Receipt>('/api/bookings', { method: 'POST', body: data })
      setBooking(receipt)
      toast.success('Pengajuan terkirim')
      window.scrollTo({ top: 0, behavior: 'instant' })
    } catch (err) {
      setError((err as Error).message)
      slots.retry()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="wrap page">
      <div className="section-head">
        <h1>Peminjaman lab</h1>
        <Link className="text-action" href="/schedule">
          Lihat jadwal <Icon name="arrow" />
        </Link>
      </div>
      {booking ? (
        <>
          <BookingReceipt booking={booking} submitted />
          <Link className="text-action after-link" href="/schedule">
            Pilih sesi lain <Icon name="arrow" />
          </Link>
        </>
      ) : (
        <div className="form-layout">
          <form className="paper form-stack" onSubmit={submit}>
            <fieldset disabled={busy}>
              <legend>Identitas peminjam</legend>
              <div className="field-grid">
                <label>
                  Nama lengkap
                  <Input autoComplete="name" name="fullName" required />
                </label>
                <label>
                  Jenis peminjam
                  <select
                    name="borrowerType"
                    required
                    value={borrowerType}
                    onChange={(e) => setBorrowerType(e.target.value as BorrowerType | '')}
                  >
                    <option value="">Pilih jenis peminjam</option>
                    {Object.entries(borrowerLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                {borrowerType && (
                  <label>
                    {borrowerType === 'dosen' ? 'NIDN atau NIP' : 'NIM'}
                    <Input key={borrowerType} name="borrowerId" required />
                  </label>
                )}
                <label>
                  Program studi
                  <select required name="prodi">
                    <option value="">Pilih program studi</option>
                    {programs.map((p) => (
                      <option key={p} value={p.toLowerCase().replace(/ /g, '-')}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>
            <fieldset disabled={busy}>
              <legend>Sesi peminjaman</legend>
              <div className="field-grid">
                <label>
                  Tanggal
                  <Input
                    type="date"
                    name="date"
                    value={date}
                    required
                    onChange={(e) => {
                      setDate(e.target.value)
                      setTimes([])
                      setError('')
                    }}
                  />
                </label>
                <div className="wide" role="group" aria-labelledby="booking-sessions-label">
                  <p className="slot-picker-label" id="booking-sessions-label">Pilih satu atau beberapa sesi</p>
                  {slots.loading && <p className="slot-picker-status" role="status">Memuat ketersediaan sesi…</p>}
                  <div className="slot-picker" aria-busy={slots.loading}>
                    {LAB_TIME_SLOT_OPTIONS.map(({ value, label }) => {
                      const checked = times.includes(value)
                      const taken = occupied.has(value)
                      return (
                        <label key={value} className="slot-choice">
                          <input
                            type="checkbox"
                            name="timeSlots"
                            value={value}
                            checked={checked}
                            disabled={!date || slots.loading || !!slots.error || (taken && !checked)}
                            onChange={(e) => {
                              const next = e.currentTarget.checked
                              setTimes((current) => next ? [...current, value] : current.filter((slot) => slot !== value))
                              setError('')
                              void pulse(summary.current)
                            }}
                          />
                          <span>{label} {taken && <small>Terisi</small>}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <label className="wide">
                  Keperluan
                  <textarea
                    name="purpose"
                    rows={3}
                    required
                    placeholder="Kegiatan yang akan dilakukan di lab"
                  />
                </label>
              </div>
            </fieldset>
            <fieldset disabled={busy}>
              <legend>Lampiran</legend>
              <div className="field-grid">
                {borrowerType === 'mahasiswa' && (
                  <label className="wide">
                    Foto KTM <small>Opsional · JPG atau PNG · maksimal 2 MB</small>
                    <Input type="file" name="ktm" accept=".jpg,.jpeg,.png" />
                  </label>
                )}
                <label className="wide">
                  Surat Korin <small>Opsional · PDF, DOC, atau DOCX · maksimal 2 MB</small>
                  <Input type="file" name="korin" accept=".pdf,.doc,.docx" />
                </label>
              </div>
            </fieldset>
            {error && conflicting.length === 0 && <Banner>{error}</Banner>}
            {slots.error && (
              <Banner retry={slots.retry}>Ketersediaan sesi belum bisa dimuat.</Banner>
            )}
            {conflicting.length > 0 && (
              <Banner>Batalkan pilihan sesi yang sudah terisi untuk melanjutkan.</Banner>
            )}
            <Button
              type="submit"
              disabled={busy || slots.loading || !!slots.error || conflicting.length > 0}
            >
              <Icon name="send" />
              {busy ? 'Mengirim pengajuan…' : 'Kirim pengajuan'}
            </Button>
          </form>
          <aside ref={summary} className="summary-ticket">
            <Icon name="calendar" size={32} />
            <h2>Sesi pilihan</h2>
            <p>{date ? dateLabel(date) : 'Pilih tanggal'}</p>
            <div aria-live="polite" aria-atomic="true">
              {selected.length ? (
                <>
                  <ul className="session-list">
                    {selected.map(({ value, label }) => <li key={value}>{label}</li>)}
                  </ul>
                  <small>Waktu Indonesia Barat</small>
                </>
              ) : <strong>Pilih waktu</strong>}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
