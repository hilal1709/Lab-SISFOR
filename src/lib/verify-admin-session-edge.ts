/**
 * Edge-safe HMAC verify (middleware). Must match `signAdminSessionToken` in admin-session.ts.
 */
function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return toBase64Url(sig)
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i)! ^ b.charCodeAt(i)!
  return out === 0
}

export async function verifyAdminSessionTokenEdge(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !token.includes('.')) return false
  const dot = token.lastIndexOf('.')
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!payload || !sig) return false

  let parsed: { exp?: number }
  try {
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    const padded = pad ? b64 + '='.repeat(4 - pad) : b64
    parsed = JSON.parse(atob(padded)) as { exp?: number }
  } catch {
    return false
  }

  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) return false

  const expected = await hmacSha256Base64Url(secret, payload)
  return timingSafeEqualStr(expected, sig)
}
