import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminSessionSecret } from '@/lib/admin-auth-config'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session-constants'
import { verifyAdminSessionTokenEdge } from '@/lib/verify-admin-session-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = getAdminSessionSecret()
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  if (pathname.startsWith('/admin/login')) {
    if (token && (await verifyAdminSessionTokenEdge(token, secret))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  const valid = await verifyAdminSessionTokenEdge(token, secret)
  if (!valid) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
