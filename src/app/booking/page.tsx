import { BookingForm } from '@/components/booking-form'
import { todayWib, validDate } from '@/lib/lab-date'
import { resolveLabTimeSlotFromQuery } from '@/lib/lab-time-slots'
export default function Booking({
  searchParams,
}: {
  searchParams: { date?: string; time?: string }
}) {
  const date =
    typeof searchParams.date === 'string' && validDate(searchParams.date)
      ? searchParams.date
      : todayWib()
  const time =
    typeof searchParams.time === 'string' ? resolveLabTimeSlotFromQuery(searchParams.time) : ''
  return <BookingForm key={date + time} initialDate={date} initialTime={time} />
}
