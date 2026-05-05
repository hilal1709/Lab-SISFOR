import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifyAdminSessionTokenNode } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value
  return verifyAdminSessionTokenNode(token)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }

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
