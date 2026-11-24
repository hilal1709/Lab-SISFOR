import { createHash, timingSafeEqual } from 'node:crypto'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { NextResponse } from 'next/server'

function matches(input: string | undefined, configured: string | undefined) {
  if (!input || !configured?.trim()) return false
  const digest = (value: string) => createHash('sha256').update(value.trim()).digest()
  return timingSafeEqual(digest(input), digest(configured))
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        id: { label: 'ID admin', type: 'text' },
        key: { label: 'Kata sandi', type: 'password' },
      },
      async authorize(credentials) {
        const idMatches = matches(credentials?.id, process.env.ADMIN_ID)
        const keyMatches = matches(credentials?.key, process.env.ADMIN_KEY)
        return idMatches && keyMatches ? { id: 'sisfor-admin', name: 'Admin SISFOR' } : null
      },
    }),
  ],
}

export const adminSession = () => getServerSession(authOptions)

export async function requireAdmin() {
  if (await adminSession()) return null
  return NextResponse.json(
    { error: 'Sesi admin berakhir. Silakan masuk kembali.' },
    { status: 401 },
  )
}
