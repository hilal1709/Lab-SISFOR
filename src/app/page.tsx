import { Hero } from '@/components/hero'
import { ScheduleBoard } from '@/components/schedule-board'
import { Gallery } from '@/components/gallery'
import { todayWib } from '@/lib/lab-date'

export const dynamic = 'force-dynamic'
export default function Home() {
  return (
    <>
      <Hero />
      <div className="wrap home-sections">
        <ScheduleBoard initialDate={todayWib()} compact />
        <Gallery />
      </div>
    </>
  )
}
