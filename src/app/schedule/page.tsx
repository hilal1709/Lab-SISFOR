import { ScheduleBoard } from '@/components/schedule-board'
import { todayWib } from '@/lib/lab-date'
export const dynamic = 'force-dynamic'
export default function Schedule() {
  return (
    <div className="wrap page">
      <ScheduleBoard initialDate={todayWib()} />
    </div>
  )
}
