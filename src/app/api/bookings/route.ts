import { NextRequest, NextResponse } from 'next/server'
import { isValidLabTimeSlot } from '@/lib/lab-time-slots'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date')

    if (dateParam) {
      const startDate = new Date(dateParam + 'T00:00:00Z')
      const endDate = new Date(dateParam + 'T23:59:59Z')

      const bookings = await prisma.booking.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(bookings)
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pemesanan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (typeof body.timeSlot !== 'string' || !isValidLabTimeSlot(body.timeSlot.trim())) {
      return NextResponse.json({ error: 'Sesi waktu tidak valid' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        fullName: body.fullName,
        studentId: body.studentId,
        date: new Date(body.date),
        timeSlot: body.timeSlot.trim(),
        purpose: body.purpose,
        status: 'pending',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('POST booking error:', error)
    return NextResponse.json({ error: 'Gagal membuat pemesanan' }, { status: 500 })
  }
}
