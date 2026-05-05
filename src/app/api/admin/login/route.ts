import { NextResponse } from 'next/server'
import { COOKIE_NAME, MAX_AGE_SEC, signAdminSessionToken } from '@/lib/admin-session'
import { adminSessionCookieSecure, getExpectedAdminCredentials } from '@/lib/admin-auth-config'

function normalizeInput(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\r/g, '').trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const admin_id = normalizeInput(body?.admin_id)
    const security_key = normalizeInput(body?.security_key)

    const { id: expectedId, key: expectedKey } = getExpectedAdminCredentials()

    if (!admin_id || !security_key || admin_id !== expectedId || security_key !== expectedKey) {
      return NextResponse.json({ ok: false, message: 'Kredensial tidak valid' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set({
      name: COOKIE_NAME,
      value: signAdminSessionToken(),
      httpOnly: true,
      path: '/',
      maxAge: MAX_AGE_SEC,
      sameSite: 'lax',
      secure: adminSessionCookieSecure(),
    })
    return res
  } catch {
    return NextResponse.json({ ok: false, message: 'Permintaan tidak valid' }, { status: 400 })
  }
}
