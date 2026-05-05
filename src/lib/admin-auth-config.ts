/** Strip whitespace / CR from .env (Windows CRLF, accidental spaces). */
function normalizeCredential(value: string): string {
  return value.replace(/\r/g, '').trim()
}

/** HMAC secret for admin session cookie (must match Edge middleware). */
export function getAdminSessionSecret(): string {
  const raw =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_KEY ||
    'sisfor-dev-change-me-in-production'
  return normalizeCredential(raw)
}

export function getExpectedAdminCredentials(): { id: string; key: string } {
  return {
    id: normalizeCredential(process.env.ADMIN_ID ?? 'admin'),
    key: normalizeCredential(process.env.ADMIN_KEY ?? 'password'),
  }
}

/**
 * `Secure` cookies are not stored on http:// — breaks `next start` on localhost.
 * Set ADMIN_COOKIE_SECURE=false in .env.local for that case.
 * In `next dev`, this always returns false.
 */
export function adminSessionCookieSecure(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return false
  }
  const v = process.env.ADMIN_COOKIE_SECURE?.toLowerCase()
  if (v === 'false' || v === '0') {
    return false
  }
  if (v === 'true' || v === '1') {
    return true
  }
  return true
}
