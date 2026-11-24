import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export async function POST(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    const extension = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: 'Hanya png, jpg, jpeg, webp yang diizinkan' },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery')
    const filePath = path.join(uploadDir, fileName)

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ url: `/uploads/gallery/${fileName}` }, { status: 201 })
  } catch (error) {
    console.error('Upload gallery image error:', error)
    return NextResponse.json({ error: 'Gagal mengunggah gambar' }, { status: 500 })
  }
}
