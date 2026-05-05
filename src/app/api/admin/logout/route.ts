import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/admin-session'
import { adminSessionCookieSecure } from '@/lib/admin-auth-config'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: adminSessionCookieSecure(),
  })
  return res
}
