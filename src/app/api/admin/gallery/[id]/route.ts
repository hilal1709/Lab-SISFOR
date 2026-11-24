import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    await prisma.labGallery.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE admin gallery error:', error)
    return NextResponse.json({ error: 'Gagal menghapus item galeri' }, { status: 500 })
  }
}
