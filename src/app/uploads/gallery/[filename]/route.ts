import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

// next start indexes public/ at startup. Serve uploads created after that snapshot.
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const match = /^\d+-[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}\.(png|jpe?g|webp)$/i.exec(params.filename)
  if (!match) return new NextResponse(null, { status: 404 })

  try {
    const bytes = await readFile(path.join(process.cwd(), 'public', 'uploads', 'gallery', params.filename))
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': imageTypes[match[1].toLowerCase()],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return new NextResponse(null, { status: (error as NodeJS.ErrnoException).code === 'ENOENT' ? 404 : 500 })
  }
}
