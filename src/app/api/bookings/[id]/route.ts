import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { parseLabTimeSlots } from '@/lib/lab-time-slots'
import { requireAdmin } from '@/lib/auth'
import { bookingTimeSlots, receiptFields, withBookingTimeSlots } from '@/lib/booking'
import { bookingDay, bookingTransaction, findBookingConflict } from '@/lib/booking-db'
import { validDate } from '@/lib/lab-date'

export const dynamic = 'force-dynamic'
type Context = { params: { id: string } }

const patchFields = z.object({
  fullName: z.string().trim().min(1).optional(),
  studentId: z.string().trim().min(1).optional(),
  borrowerId: z.string().trim().min(1).optional(),
  borrowerType: z.enum(['mahasiswa', 'dosen']).optional(),
  prodi: z.string().trim().min(1).optional(),
  purpose: z.string().trim().min(1).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  timeSlot: z.string().optional(),
  timeSlots: z.array(z.string()).optional(),
  date: z.string().optional(),
})

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: receiptFields,
    })
    return booking
      ? NextResponse.json(withBookingTimeSlots(booking))
      : NextResponse.json({ error: 'ID peminjaman tidak ditemukan.' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Status belum bisa dimuat. Coba lagi.' }, { status: 503 })
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const parsed = patchFields.safeParse(await request.json().catch(() => null))
    if (!parsed.success)
      return NextResponse.json({ error: 'Data perubahan tidak valid.' }, { status: 400 })
    const body = parsed.data
    const requestedSlots = body.timeSlots ?? (body.timeSlot === undefined ? undefined : [body.timeSlot])
    const timeSlots = parseLabTimeSlots(requestedSlots)
    if (requestedSlots && !timeSlots)
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 400 })
    const day = body.date?.slice(0, 10)
    if (body.date !== undefined && (!day || !validDate(day) || !Number.isFinite(Date.parse(body.date))))
      return NextResponse.json({ error: 'Tanggal tidak valid.' }, { status: 400 })
    const result = await bookingTransaction(async (tx) => {
      const current = await tx.booking.findUnique({ where: { id: params.id }, select: receiptFields })
      if (!current) return { error: 'ID peminjaman tidak ditemukan.', status: 404 }
      const currentSlots = bookingTimeSlots(current)
      if (currentSlots.length > 1 && body.timeSlot !== undefined && body.timeSlots === undefined)
        return { error: 'Kirim daftar sesi untuk mengubah pengajuan beberapa sesi.', status: 400 }

      const status = body.status ?? current.status
      if (status !== 'rejected' && (day || timeSlots || current.status === 'rejected')) {
        const targetDay = day ?? current.date.toISOString().slice(0, 10)
        if (await findBookingConflict(tx, targetDay, timeSlots ?? currentSlots, current.id))
          return { error: 'Salah satu sesi sudah terisi. Pilih sesi lain.', status: 409 }
      }

      const booking = await tx.booking.update({
        where: { id: current.id },
        data: {
          fullName: body.fullName,
          studentId: body.borrowerId ?? body.studentId,
          borrowerType: body.borrowerType,
          prodi: body.prodi,
          purpose: body.purpose,
          status: body.status,
          timeSlot: timeSlots?.[0],
          timeSlots: timeSlots ?? undefined,
          date: day ? bookingDay(day).gte : undefined,
        },
        select: receiptFields,
      })
      return { booking }
    })
    return result.booking
      ? NextResponse.json(withBookingTimeSlots(result.booking))
      : NextResponse.json({ error: result.error }, { status: result.status })
  } catch {
    return NextResponse.json({ error: 'Perubahan belum tersimpan. Coba lagi.' }, { status: 503 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    await prisma.booking.delete({ where: { id: params.id }, select: { id: true } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Pengajuan belum terhapus. Muat ulang daftar.' },
      { status: 400 },
    )
  }
}
