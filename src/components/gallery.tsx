'use client'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Keyboard } from 'swiper/modules'
import type { Swiper as Slider } from 'swiper'
import 'swiper/css'
import type { GalleryItem } from '@/lib/booking'
import { useRemote } from '@/lib/client-data'
import { Icon } from './ui/icon'
import { Banner } from './ui/feedback'
import { Button } from './ui/button'

export function Gallery() {
  const section = useRef<HTMLElement>(null)
  const slider = useRef<Slider>()
  const [index, setIndex] = useState(0)
  const gallery = useRemote<GalleryItem[]>('/api/gallery')
  useEffect(() => {
    let alive = true
    const el = section.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    void import('aos').then(({ default: aos }) => {
      if (!alive) return
      el.dataset.aos = 'gallery'
      aos.init({ duration: 450, once: true, offset: 20, disableMutationObserver: true })
      aos.refreshHard()
    })
    return () => {
      alive = false
      el?.removeAttribute('data-aos')
    }
  }, [])
  const items = gallery.data || []
  return (
    <section ref={section} className="gallery">
      <div className="section-head">
        <h2>Galeri lab</h2>
        {items.length > 1 && (
          <div className="actions">
            <span className="figure-count">
              {index + 1} / {items.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Foto sebelumnya"
              disabled={index === 0}
              onClick={() => slider.current?.slidePrev()}
            >
              <Icon name="prev" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Foto berikutnya"
              disabled={index === items.length - 1}
              onClick={() => slider.current?.slideNext()}
            >
              <Icon name="next" />
            </Button>
          </div>
        )}
      </div>
      {gallery.loading ? (
        <div className="skeleton" aria-label="Memuat galeri" />
      ) : gallery.error ? (
        <Banner retry={gallery.retry}>Galeri belum bisa dimuat.</Banner>
      ) : items.length === 0 ? (
        <div className="empty-line">
          <Icon name="image" />
          Belum ada foto lab.
        </div>
      ) : (
        <Swiper
          modules={[A11y, Keyboard]}
          keyboard={{ enabled: items.length > 1, onlyInViewport: true }}
          allowTouchMove={items.length > 1}
          speed={
            typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 0
              : 320
          }
          onSwiper={(value) => {
            slider.current = value
          }}
          onSlideChange={(value) => setIndex(value.activeIndex)}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <figure className="gallery-print">
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
                <figcaption>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  )
}
