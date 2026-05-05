/**
 * Single source of truth for lab schedule + booking time slots.
 * Each value is the slot start (24h HH:mm); duration is 1 hour until the next start.
 */

export type LabTimeSlotOption = {
  value: string
  label: string
}

const SLOT_STARTS = [
  '07:30',
  '08:30',
  '09:30',
  '10:30',
  '11:30',
  '12:30',
  '13:30',
  '14:30',
  '15:30',
  '16:30',
  '17:30',
] as const

function addOneHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(Date.UTC(2000, 0, 1, h, m))
  d.setUTCHours(d.getUTCHours() + 1)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

function formatClock12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(Date.UTC(2000, 0, 1, h, m))
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
}

export const LAB_TIME_SLOT_OPTIONS: LabTimeSlotOption[] = SLOT_STARTS.map(start => {
  const end = addOneHour(start)
  return {
    value: start,
    label: `${formatClock12(start)} – ${formatClock12(end)}`,
  }
})

/** Values in schedule order (matches grid on /schedule). */
export const LAB_TIME_SLOT_VALUES: string[] = LAB_TIME_SLOT_OPTIONS.map(o => o.value)

export function getLabTimeSlotLabel(value: string): string {
  return LAB_TIME_SLOT_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function isValidLabTimeSlot(value: string): boolean {
  return LAB_TIME_SLOT_OPTIONS.some(o => o.value === value)
}

/**
 * Map query param (e.g. from /booking?time=09:30) to a canonical slot value.
 * Accepts minor variants like `9:30` → `09:30` when it matches a lab slot.
 */
export function resolveLabTimeSlotFromQuery(raw: string | null | undefined): string {
  if (raw == null) return ''
  const trimmed = raw.trim()
  if (LAB_TIME_SLOT_OPTIONS.some(o => o.value === trimmed)) {
    return trimmed
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (!match) return ''
  const hh = match[1]!.padStart(2, '0')
  const mm = match[2]!
  const candidate = `${hh}:${mm}`
  return LAB_TIME_SLOT_OPTIONS.some(o => o.value === candidate) ? candidate : ''
}
