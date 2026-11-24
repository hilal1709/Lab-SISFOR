const wibFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const todayWib = (now = new Date()) => wibFormatter.format(now)

export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function shiftDate(value: string, days: number) {
  const date = new Date(value + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function dateLabel(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Date(value.slice(0, 10) + 'T00:00:00Z').toLocaleDateString('id-ID', {
    ...(options || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    timeZone: 'Asia/Jakarta',
  })
}
