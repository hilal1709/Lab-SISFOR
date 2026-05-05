import { NextRequest, NextResponse } from 'next/server'
import { isValidLabTimeSlot } from '@/lib/lab-time-slots'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Pemesanan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('GET booking error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pemesanan' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    if (body.timeSlot !== undefined) {
      const slot = typeof body.timeSlot === 'string' ? body.timeSlot.trim() : ''
      if (!isValidLabTimeSlot(slot)) {
        return NextResponse.json({ error: 'Sesi waktu tidak valid' }, { status: 400 })
      }
      body.timeSlot = slot
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.studentId && { studentId: body.studentId }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.timeSlot && { timeSlot: body.timeSlot }),
        ...(body.purpose && { purpose: body.purpose }),
        ...(body.status && { status: body.status }),
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('PATCH booking error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui pemesanan' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('DELETE booking error:', error)
    return NextResponse.json({ error: 'Gagal menghapus pemesanan' }, { status: 500 })
  }
}
