'use client'
import { signIn } from 'next-auth/react'
import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Banner } from '@/components/ui/feedback'
import { Icon } from '@/components/ui/icon'

export default function Login() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        id: fields.get('id'),
        key: fields.get('key'),
        redirect: false,
        callbackUrl: '/admin',
      })
      if (!result?.ok || result.error)
        throw new Error('ID admin atau kata sandi salah. Periksa kembali.')
      window.location.assign('/admin')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }
  return (
    <div className="wrap page login-page">
      <section className="login-art" aria-hidden="true">
        <img src="/art/workstation.svg" alt="" />
      </section>
      <form onSubmit={submit} className="login-form">
        <Icon name="lock" size={36} />
        <h1>Masuk admin</h1>
        <p>Kelola peminjaman dan galeri Lab SISFOR.</p>
        <label>
          ID admin
          <Input name="id" required autoComplete="username" />
        </label>
        <label>
          Kata sandi
          <Input type="password" name="key" required autoComplete="current-password" />
        </label>
        {error && <Banner>{error}</Banner>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Sedang masuk…' : 'Masuk'}
          <Icon name="enter" />
        </Button>
      </form>
    </div>
  )
}
