'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import gsap from 'gsap'
import anime from 'animejs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  admin_id: z.string().min(1, 'Masukkan ID sistem'),
  security_key: z.string().min(1, 'Masukkan kunci keamanan'),
})

type FormValues = z.infer<typeof formSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { admin_id: '', security_key: '' },
  })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.login-hero', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
      gsap.fromTo(
        '.login-card',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.2)', delay: 0.05 }
      )
    }, rootRef)

    anime({
      targets: '.form-field',
      opacity: [0, 1],
      translateY: [10, 0],
      delay: anime.stagger(70, { start: 120 }),
      duration: 480,
      easing: 'easeOutQuad',
    })

    return () => ctx.revert()
  }, [])

  const onSubmit = form.handleSubmit(async values => {
    form.clearErrors('root')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          admin_id: values.admin_id.trim(),
          security_key: values.security_key.trim(),
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body?.message || 'Tidak diizinkan')
      }

      gsap.to('.login-card', {
        y: -6,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => router.push('/admin'),
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal'
      form.setError('root', { message })
    }
  })

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center px-4 py-8 font-body-md text-body-md text-on-background'
      )}
    >
      <div className="admin-login-grid pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <Card className="login-card relative z-10 w-full max-w-md p-8">
        <CardHeader className="login-hero mb-2 space-y-0 border-b-border-width-standard border-black pb-4 text-center">
          <span
            className="material-symbols-outlined filled mb-2 block text-headline-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            admin_panel_settings
          </span>
          <CardTitle>AKSES_ADMIN</CardTitle>
          <CardDescription className="mt-2">Sistem SISFOR Lab</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <div className="form-field space-y-2">
              <Label htmlFor="admin_id">ID_ADMIN</Label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  badge
                </span>
                <Input
                  id="admin_id"
                  autoComplete="username"
                  placeholder="Masukkan ID Sistem"
                  className="pl-10"
                  aria-invalid={!!form.formState.errors.admin_id}
                  {...form.register('admin_id')}
                />
              </div>
              {form.formState.errors.admin_id ? (
                <p className="font-label-mono text-label-mono text-error">{form.formState.errors.admin_id.message}</p>
              ) : null}
            </div>

            <div className="form-field space-y-2">
              <Label htmlFor="security_key">KUNCI_KEAMANAN</Label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  key
                </span>
                <Input
                  id="security_key"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="pl-10"
                  aria-invalid={!!form.formState.errors.security_key}
                  {...form.register('security_key')}
                />
              </div>
              {form.formState.errors.security_key ? (
                <p className="font-label-mono text-label-mono text-error">
                  {form.formState.errors.security_key.message}
                </p>
              ) : null}
            </div>

            {form.formState.errors.root ? (
              <div
                className="border-border-width-standard border-black bg-error-container px-3 py-3 font-label-mono text-label-mono text-error"
                role="alert"
              >
                {form.formState.errors.root.message}
              </div>
            ) : null}

            <Button type="submit" disabled={form.formState.isSubmitting} className="mt-2 w-full">
              <span>{form.formState.isSubmitting ? 'MENGAUTENTIKASI…' : 'MASUK_SISTEM'}</span>
              <span className="material-symbols-outlined">login</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="mt-2 flex flex-col border-t-2 border-dashed border-black pt-4">
          <p className="font-label-mono text-label-mono flex items-center justify-center gap-1 font-bold uppercase text-error">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            HANYA UNTUK PERSONEL BERWENANG
          </p>
        </CardFooter>
      </Card>

      <div className="pointer-events-none absolute bottom-8 right-8 hidden font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant md:block">
        STATUS_SISTEM: <span className="font-bold text-primary">AKTIF</span> // v2.4.1
      </div>
    </div>
  )
}
