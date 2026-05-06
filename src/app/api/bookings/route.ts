import { NextRequest, NextResponse } from 'next/server'
import { isValidLabTimeSlot } from '@/lib/lab-time-slots'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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
    let fullName = ''
    let studentId = ''
    let prodi = ''
    let purpose = ''
    let timeSlot = ''
    let date = new Date('')
    let korinFilename: string | undefined
    let korinData: string | undefined
    let ktmFilename: string | undefined
    let ktmData: string | undefined

    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      fullName = (fd.get('fullName') as string) || ''
      studentId = (fd.get('studentId') as string) || ''
      prodi = (fd.get('prodi') as string) || ''
      purpose = (fd.get('purpose') as string) || ''
      timeSlot = (fd.get('timeSlot') as string) || ''
      const dateStr = (fd.get('date') as string) || ''
      date = typeof dateStr === 'string' ? new Date(`${dateStr}T00:00:00Z`) : new Date('')

      const korin = fd.get('korin') as File | null
      if (korin && typeof (korin as any).arrayBuffer === 'function') {
        const buf = Buffer.from(await korin.arrayBuffer())
        korinData = `data:${korin.type};base64,${buf.toString('base64')}`
        korinFilename = (korin as any).name
      }

      const ktm = fd.get('ktm') as File | null
      if (ktm && typeof (ktm as any).arrayBuffer === 'function') {
        const buf = Buffer.from(await ktm.arrayBuffer())
        ktmData = `data:${ktm.type};base64,${buf.toString('base64')}`
        ktmFilename = (ktm as any).name
      }
    } else {
      const body = await request.json()
      fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
      studentId = typeof body.studentId === 'string' ? body.studentId.trim() : ''
      prodi = typeof body.prodi === 'string' ? body.prodi.trim() : ''
      purpose = typeof body.purpose === 'string' ? body.purpose.trim() : ''
      timeSlot = typeof body.timeSlot === 'string' ? body.timeSlot.trim() : ''
      date = typeof body.date === 'string' ? new Date(`${body.date}T00:00:00Z`) : new Date('')
    }

    if (!fullName || !studentId || !prodi || !purpose) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (!isValidLabTimeSlot(timeSlot)) {
      return NextResponse.json({ error: 'Sesi waktu tidak valid' }, { status: 400 })
    }

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Tanggal tidak valid' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        fullName,
        studentId,
        prodi,
        date,
        timeSlot,
        purpose,
        status: 'pending',
        ...(korinFilename && { korinFilename }),
        ...(korinData && { korinData }),
        ...(ktmFilename && { ktmFilename }),
        ...(ktmData && { ktmData }),
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('POST booking error:', error)
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Koneksi database gagal. Cek DATABASE_URL di deployment.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: 'Gagal membuat pemesanan' }, { status: 500 })
  }
}
