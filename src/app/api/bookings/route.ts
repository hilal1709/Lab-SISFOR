import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import {
  adminFields, BOOKING_ATTACHMENT_LIMIT, bookingTimeSlots, receiptFields, withBookingTimeSlots,
} from '@/lib/booking'
import { bookingDay, bookingTransaction, findBookingConflict } from '@/lib/booking-db'
import { parseLabTimeSlots } from '@/lib/lab-time-slots'
import { validDate } from '@/lib/lab-date'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const day = request.nextUrl.searchParams.get('date')
    if (day !== null) {
      if (!validDate(day))
        return NextResponse.json({ error: 'Tanggal tidak valid.' }, { status: 400 })
      const rows = await prisma.booking.findMany({
        where: {
          date: bookingDay(day),
          status: { not: 'rejected' },
        },
        select: { timeSlot: true, timeSlots: true },
      })
      const occupied = [...new Set(rows.flatMap(bookingTimeSlots))]
      return NextResponse.json(occupied.map((timeSlot) => ({ timeSlot })))
    }
    const denied = await requireAdmin()
    if (denied) return denied
    const rows = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, select: adminFields })
    return NextResponse.json(rows.map(withBookingTimeSlots))
  } catch {
    return NextResponse.json({ error: 'Data peminjaman belum bisa dimuat.' }, { status: 503 })
  }
}

const formats = {
  pdf: { mime: 'application/pdf', signature: '255044462d' },
  doc: { mime: 'application/msword', signature: 'd0cf11e0a1b11ae1' },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    signature: '504b0304',
  },
  jpg: { mime: 'image/jpeg', signature: 'ffd8ff' },
  jpeg: { mime: 'image/jpeg', signature: 'ffd8ff' },
  png: { mime: 'image/png', signature: '89504e470d0a1a0a' },
}

async function attachment(
  file: FormDataEntryValue | null,
  kind: 'ktm' | 'korin',
): Promise<{ error?: string; name?: string; data?: string }> {
  if (!file || (typeof file !== 'string' && !file.name && !file.size)) return {}
  const label = kind === 'ktm' ? 'Foto KTM' : 'Surat Korin'
  const formatError = {
    error: `${label} harus berupa ${kind === 'ktm' ? 'JPG atau PNG' : 'PDF, DOC, atau DOCX'}.`,
  }
  if (typeof file === 'string' || !file.size) return formatError
  if (file.size > BOOKING_ATTACHMENT_LIMIT) return { error: `Ukuran ${label} maksimal 2 MB.` }
  const extension = file.name.match(/\.([a-z]+)$/i)?.[1].toLowerCase() ?? ''
  const allowed = kind === 'ktm' ? ['jpg', 'jpeg', 'png'] : ['pdf', 'doc', 'docx']
  if (!allowed.includes(extension)) return formatError
  const { mime, signature } = formats[extension as keyof typeof formats]
  const bytes = Buffer.from(await file.arrayBuffer())
  if (!bytes.subarray(0, signature.length / 2).equals(Buffer.from(signature, 'hex')) ||
    (extension === 'docx' && !bytes.includes('word/document.xml')))
    return formatError
  return { name: file.name, data: `data:${mime};base64,${bytes.toString('base64')}` }
}

export async function POST(request: NextRequest) {
  try {
    const multipart = request.headers.get('content-type')?.includes('multipart/form-data')
    const form = multipart ? await request.formData().catch(() => null) : null
    const input: unknown = multipart ? form : await request.json().catch(() => null)
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return NextResponse.json({ error: 'Data pengajuan tidak valid.' }, { status: 400 })
    const get = (key: string): unknown =>
      form ? form.get(key) : (input as Record<string, unknown>)[key]
    const field = (key: string): string => {
      const value = get(key)
      return typeof value === 'string' ? value.trim() : ''
    }
    const rawBorrowerType = get('borrowerType')
    const borrowerType = (form ? rawBorrowerType === null : rawBorrowerType === undefined)
      ? 'mahasiswa'
      : field('borrowerType')
    const fullName = field('fullName'),
      studentId = field('borrowerId') || field('studentId'),
      prodi = field('prodi'),
      purpose = field('purpose')
    const day = field('date')
    const requestedSlots = form ? form.getAll('timeSlots') : get('timeSlots')
    const hasTimeSlots = form ? form.has('timeSlots') : requestedSlots !== undefined
    const timeSlots = parseLabTimeSlots(hasTimeSlots ? requestedSlots : [field('timeSlot')])
    if (
      !fullName ||
      !studentId ||
      !prodi ||
      !purpose ||
      !validDate(day) ||
      (borrowerType !== 'mahasiswa' && borrowerType !== 'dosen') ||
      !timeSlots
    ) {
      return NextResponse.json(
        { error: 'Periksa identitas, tanggal, sesi, dan keperluan peminjaman.' },
        { status: 400 },
      )
    }
    const ktm = await attachment(
      borrowerType === 'mahasiswa' ? form?.get('ktm') ?? null : null,
      'ktm',
    )
    const korin = await attachment(form?.get('korin') ?? null, 'korin')
    if (ktm.error || korin.error)
      return NextResponse.json({ error: ktm.error || korin.error }, { status: 400 })

    const result = await bookingTransaction(async (tx) => {
      if (await findBookingConflict(tx, day, timeSlots)) return null
      return tx.booking.create({
        data: {
          fullName,
          studentId,
          borrowerType,
          prodi,
          purpose,
          date: bookingDay(day).gte,
          timeSlot: timeSlots[0],
          timeSlots,
          ktmFilename: ktm.name,
          ktmData: ktm.data,
          korinFilename: korin.name,
          korinData: korin.data,
        },
        select: receiptFields,
      })
    })
    if (result) return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Pengajuan belum tersimpan. Periksa koneksi lalu coba lagi.' },
      { status: 503 },
    )
  }
  return NextResponse.json(
    { error: 'Sesi baru saja terisi. Silakan pilih sesi lain.' },
    { status: 409 },
  )
}
