'use client'
import { useState } from 'react'
import { useRemote } from '@/lib/client-data'
import type { Receipt } from '@/lib/booking'
import { BookingReceipt } from './receipt'
import { Banner } from './ui/feedback'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

export function StatusLookup({ initialId }: { initialId: string }) {
  const [input, setInput] = useState(initialId),
    [id, setId] = useState(initialId)
  const result = useRemote<Receipt>(id ? '/api/bookings/' + encodeURIComponent(id) : null)
  return (
    <div className="wrap page narrow">
      <h1>Cek status</h1>
      <p className="intro">Masukkan ID yang tercantum pada bukti pengajuan peminjaman.</p>
      <form
        className="paper lookup"
        onSubmit={(e) => {
          e.preventDefault()
          const next = input.trim()
          if (!next) return
          if (next === id) result.retry()
          else setId(next)
        }}
      >
        <label>
          ID peminjaman
          <Input
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>
        <Button type="submit" disabled={result.loading}>
          <Icon name="search" />
          {result.loading ? 'Mencari…' : 'Cari pengajuan'}
        </Button>
      </form>
      <div className="result" aria-live="polite">
        {result.error && <Banner retry={result.retry}>{result.error}</Banner>}
        {result.data && <BookingReceipt key={result.data.id} booking={result.data} />}
      </div>
    </div>
  )
}
