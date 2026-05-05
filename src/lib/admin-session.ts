import { createHmac, timingSafeEqual } from 'crypto'
import { getAdminSessionSecret } from '@/lib/admin-auth-config'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SEC } from '@/lib/admin-session-constants'

export const COOKIE_NAME = ADMIN_SESSION_COOKIE
export const MAX_AGE_SEC = ADMIN_SESSION_MAX_AGE_SEC

/** Create signed session token (Node runtime — API routes). */
export function signAdminSessionToken(): string {
  const secret = getAdminSessionSecret()
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000 })
  ).toString('base64url')
  const sig = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/** Verify token in Node (e.g. tests or server actions). */
export function verifyAdminSessionTokenNode(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const secret = getAdminSessionSecret()
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}
