import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const items = await prisma.labGallery.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET admin gallery error:', error)
    return NextResponse.json({ error: 'Gagal mengambil galeri' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : ''
    const description = typeof body?.description === 'string' ? body.description.trim() : ''

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Judul dan URL gambar wajib diisi' }, { status: 400 })
    }

    const item = await prisma.labGallery.create({
      data: {
        title,
        imageUrl,
        description: description || null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('POST admin gallery error:', error)
    return NextResponse.json({ error: 'Gagal membuat item galeri' }, { status: 500 })
  }
}
