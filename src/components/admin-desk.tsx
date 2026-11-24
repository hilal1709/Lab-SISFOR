'use client'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { type AdminBooking, type BookingStatus, type GalleryItem, borrowerLabels, statusText } from '@/lib/booking'
import { useRemote, requestJson } from '@/lib/client-data'
import { dateLabel } from '@/lib/lab-date'
import { getLabTimeSlotLabel } from '@/lib/lab-time-slots'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'
import { Badge, Banner, Modal } from './ui/feedback'

type Selection =
  | { type: 'detail' | 'deleteBooking'; booking: AdminBooking }
  | { type: 'deletePhoto'; item: GalleryItem }

export function AdminDesk() {
  const bookings = useRemote<AdminBooking[]>('/api/bookings'),
    gallery = useRemote<GalleryItem[]>('/api/admin/gallery')
  const [query, setQuery] = useState(''),
    [selection, setSelection] = useState<Selection | null>(null)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [galleryError, setGalleryError] = useState(''),
    [saving, setSaving] = useState(false)
  const rows = bookings.data?.filter((row) =>
    [row.fullName, borrowerLabels[row.borrowerType], row.studentId, row.prodi, row.purpose,
      ...row.timeSlots, ...row.timeSlots.map(getLabTimeSlotLabel), statusText[row.status]]
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  function select(value: Selection | null) {
    setSelection(value)
    setError('')
  }

  async function update(status?: BookingStatus) {
    if (!selection || busy) return
    setBusy(true)
    setError('')
    try {
      if (selection.type === 'deletePhoto') {
        await requestJson('/api/admin/gallery/' + selection.item.id, { method: 'DELETE' })
        gallery.retry()
        toast.success('Foto galeri dihapus')
      } else {
        const id = selection.booking.id
        await requestJson(
          '/api/bookings/' + id,
          status
            ? {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
              }
            : { method: 'DELETE' },
        )
        bookings.retry()
        toast.success(status ? 'Status pengajuan diperbarui' : 'Pengajuan dihapus')
      }
      select(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function addPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = event.currentTarget,
      fields = new FormData(form)
    const file = fields.get('file') as File | null
    let imageUrl = String(fields.get('url') || '').trim()
    if (!file?.size && !imageUrl) {
      setGalleryError('Pilih file foto atau isi URL gambar.')
      return
    }
    setSaving(true)
    setGalleryError('')
    try {
      if (file?.size) {
        const upload = new FormData()
        upload.set('file', file)
        imageUrl = (
          await requestJson<{ url: string }>('/api/admin/gallery/upload', {
            method: 'POST',
            body: upload,
          })
        ).url
      }
      await requestJson('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fields.get('title'),
          imageUrl,
          description: fields.get('description'),
        }),
      })
      form.reset()
      gallery.retry()
      toast.success('Foto ditambahkan ke galeri')
    } catch (err) {
      setGalleryError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }
  const detail = selection?.type === 'detail' ? selection.booking : null
  return (
    <div className="wrap page">
      <div className="section-head">
        <div>
          <h1>Meja admin</h1>
          <p>Pengajuan peminjaman dan galeri laboratorium.</p>
        </div>
      </div>
      <section className="desk-section">
        <div className="section-head">
          <h2 id="desk-heading" tabIndex={-1}>
            Antrean pengajuan
          </h2>
          <label className="search-control">
            <Icon name="search" />
            <Input
              aria-label="Cari pengajuan"
              placeholder="Peminjam atau sesi"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {bookings.error ? (
          <Banner retry={bookings.retry}>{bookings.error}</Banner>
        ) : bookings.loading ? (
          <div className="skeleton" role="status">
            Memuat pengajuan…
          </div>
        ) : (
          <>
            <p className="queue-count">
              {bookings.data?.filter((row) => row.status === 'pending').length} menunggu ·{' '}
              {bookings.data?.length} pengajuan
            </p>
            {rows?.length ? (
              <table className="queue">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>Tanggal & sesi</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Tindakan</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.fullName}</strong>
                        <small>{borrowerLabels[row.borrowerType]} · {row.studentId}</small>
                      </td>
                      <td>
                        {dateLabel(row.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                        <small>{row.timeSlots.length === 1
                          ? `${getLabTimeSlotLabel(row.timeSlots[0])} WIB`
                          : `${row.timeSlots.length} sesi`}</small>
                      </td>
                      <td>
                        <Badge status={row.status} />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={'Detail pengajuan ' + row.fullName}
                          onClick={() => select({ type: 'detail', booking: row })}
                        >
                          Detail <Icon name="next" size={17} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-line">
                {query ? 'Tidak ada pengajuan yang cocok.' : 'Belum ada pengajuan.'}
              </div>
            )}
          </>
        )}
      </section>
      <section className="desk-section">
        <div className="section-head">
          <h2>Galeri lab</h2>
        </div>
        <form className="paper form-stack" onSubmit={addPhoto}>
          <div className="field-grid">
            <label>
              Judul foto
              <Input name="title" required />
            </label>
            <label>
              Keterangan <small>Opsional</small>
              <Input name="description" />
            </label>
            <label>
              Unggah foto <small>JPG, PNG, atau WebP</small>
              <Input name="file" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
            <label>
              Atau gunakan URL gambar
              <Input name="url" placeholder="https://… atau /uploads/…" />
            </label>
          </div>
          {galleryError && <Banner>{galleryError}</Banner>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan foto…' : 'Tambah foto'}
          </Button>
        </form>
        {gallery.error ? (
          <Banner retry={gallery.retry}>{gallery.error}</Banner>
        ) : gallery.loading ? (
          <div className="skeleton" role="status">
            Memuat foto…
          </div>
        ) : gallery.data?.length ? (
          <ul className="photo-list">
            {gallery.data.map((item) => (
              <li key={item.id}>
                <img src={item.imageUrl} alt="" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => select({ type: 'deletePhoto', item })}
                >
                  <Icon name="trash" />
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-line">Belum ada foto lab.</div>
        )}
      </section>
      <Modal
        open={!!selection}
        close={() => select(null)}
        busy={busy}
        title={
          detail
            ? 'Detail pengajuan'
            : selection?.type === 'deletePhoto'
              ? 'Hapus foto galeri ini?'
              : 'Hapus pengajuan ini?'
        }
        description={
          detail
            ? `${detail.fullName} · ${borrowerLabels[detail.borrowerType]}`
            : selection?.type === 'deletePhoto'
              ? 'Foto “' + selection.item.title + '” akan dihapus dari galeri.'
              : selection?.type === 'deleteBooking'
                ? 'Pengajuan ' +
                  selection.booking.fullName +
                  ' beserta lampirannya akan dihapus permanen.'
                : ''
        }
      >
        {detail && (
          <>
            <Badge status={detail.status} />
            <dl className="facts">
              <div>
                <dt>{detail.borrowerType === 'dosen' ? 'NIDN atau NIP' : 'NIM'}</dt>
                <dd>{detail.studentId}</dd>
              </div>
              <div>
                <dt>Program studi</dt>
                <dd>{detail.prodi.replace(/-/g, ' ')}</dd>
              </div>
              <div>
                <dt>Sesi</dt>
                <dd>
                  {dateLabel(detail.date)}
                  <ul className="session-list">
                    {detail.timeSlots.map((slot) => <li key={slot}>{getLabTimeSlotLabel(slot)} WIB</li>)}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Keperluan</dt>
                <dd>{detail.purpose}</dd>
              </div>
              <div>
                <dt>Lampiran</dt>
                <dd>
                  {(['ktm', 'korin'] as const)
                    .filter((kind) => detail[kind === 'ktm' ? 'ktmFilename' : 'korinFilename'])
                    .map((kind) => (
                      <a
                        key={kind}
                        className="attachment"
                        href={'/api/admin/bookings/' + detail.id + '/attachment?kind=' + kind}
                      >
                        <Icon name="download" size={17} />
                        Unduh {kind === 'ktm' ? 'KTM' : 'surat Korin'}
                      </a>
                    ))}
                  {!detail.ktmFilename && !detail.korinFilename && 'Tidak ada lampiran.'}
                </dd>
              </div>
            </dl>
          </>
        )}
        {error && <Banner>{error}</Banner>}
        <div className="actions modal-actions">
          <Button variant="outline" disabled={busy} onClick={() => select(null)}>
            {detail ? 'Tutup' : 'Batal'}
          </Button>
          {detail ? (
            <>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => select({ type: 'deleteBooking', booking: detail })}
              >
                Hapus
              </Button>
              {detail.status === 'pending' && (
                <>
                  <Button variant="outline" disabled={busy} onClick={() => void update('rejected')}>
                    Tolak
                  </Button>
                  <Button disabled={busy} onClick={() => void update('approved')}>
                    Setujui
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button disabled={busy} onClick={() => void update()}>
              {busy ? 'Menghapus…' : 'Ya, hapus'}
            </Button>
          )}
        </div>
      </Modal>
    </div>
  )
}
