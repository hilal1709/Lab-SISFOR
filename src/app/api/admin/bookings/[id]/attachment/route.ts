import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin()
  if (denied) return denied
  const kind = request.nextUrl.searchParams.get('kind')
  if (kind !== 'ktm' && kind !== 'korin') return new NextResponse(null, { status: 400 })
  const record = await prisma.booking.findUnique({
    where: { id: params.id },
    select: {
      ktmData: kind === 'ktm',
      ktmFilename: kind === 'ktm',
      korinData: kind === 'korin',
      korinFilename: kind === 'korin',
    },
  })
  const data = record?.[kind === 'ktm' ? 'ktmData' : 'korinData']
  const filename = record?.[kind === 'ktm' ? 'ktmFilename' : 'korinFilename'] || kind
  if (!data) return new NextResponse(null, { status: 404 })
  return new Response(new Uint8Array(Buffer.from(data.slice(data.indexOf(',') + 1), 'base64')), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
      'Content-Disposition':
        "attachment; filename*=UTF-8''" + encodeURIComponent(filename).replace(/'/g, '%27'),
    },
  })
}
