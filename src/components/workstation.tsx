'use client'
import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from './ui/button'

export function Workstation() {
  const holder = useRef<HTMLDivElement>(null)
  const syncPlayback = useRef<(paused: boolean) => void>()
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!holder.current) return
    const container = holder.current
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let alive = true
    let inView = typeof IntersectionObserver === 'undefined'
    let userPaused = false
    let instance: import('lottie-web').AnimationItem | undefined

    function sync() {
      if (!instance?.isLoaded) return
      if (userPaused || !inView || document.hidden || query.matches) instance.pause()
      else instance.play()
    }
    syncPlayback.current = (nextPaused) => {
      userPaused = nextPaused
      sync()
    }

    function updateReady() {
      if (!alive) return
      setReady(!query.matches && instance?.isLoaded === true)
      sync()
    }

    async function load() {
      if (instance || query.matches) return
      try {
        const { default: lottie } = await import('lottie-web/build/player/lottie_light')
        if (!alive || instance || query.matches) return
        instance = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          path: '/art/workstation.json',
        })
        instance.addEventListener('DOMLoaded', updateReady)
        instance.addEventListener('data_failed', () => {
          if (!alive) return
          instance?.destroy()
          instance = undefined
          setReady(false)
        })
      } catch {
        if (alive) setReady(false)
      }
    }

    function changeMotion() {
      updateReady()
      void load()
    }
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    observer?.observe(container)
    query.addEventListener('change', changeMotion)
    document.addEventListener('visibilitychange', sync)
    void load()
    return () => {
      alive = false
      syncPlayback.current = undefined
      observer?.disconnect()
      query.removeEventListener('change', changeMotion)
      document.removeEventListener('visibilitychange', sync)
      instance?.destroy()
    }
  }, [])

  useEffect(() => syncPlayback.current?.(paused), [paused])

  return (
    <>
      <div
        className={ready ? 'workstation is-ready' : 'workstation'}
        role="img"
        aria-label="Ilustrasi komputer lab dan lembar jadwal"
      >
        <div aria-hidden="true" ref={holder} />
      </div>
      {ready && (
        <Button
          variant="outline"
          size="icon"
          className="workstation-toggle"
          aria-label={paused ? 'Putar animasi ilustrasi' : 'Jeda animasi ilustrasi'}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </Button>
      )}
    </>
  )
}
