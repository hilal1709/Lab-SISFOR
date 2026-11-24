export const statusText = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
} as const
export type BookingStatus = keyof typeof statusText
export const borrowerLabels = { mahasiswa: 'Mahasiswa', dosen: 'Dosen' } as const
export type BorrowerType = keyof typeof borrowerLabels
export const BOOKING_ATTACHMENT_LIMIT = 2 * 1024 * 1024
export type Receipt = {
  id: string
  date: string
  timeSlot: string
  timeSlots: string[]
  status: BookingStatus
}
export type AdminBooking = Receipt & {
  fullName: string
  studentId: string
  borrowerType: BorrowerType
  prodi: string
  purpose: string
  ktmFilename: string | null
  korinFilename: string | null
}
export type GalleryItem = {
  id: string
  title: string
  imageUrl: string
  description: string | null
}

export const receiptFields = {
  id: true,
  date: true,
  timeSlot: true,
  timeSlots: true,
  status: true,
} as const
export const adminFields = {
  ...receiptFields,
  fullName: true,
  studentId: true,
  borrowerType: true,
  prodi: true,
  purpose: true,
  createdAt: true,
  ktmFilename: true,
  korinFilename: true,
} as const

export function bookingTimeSlots({ timeSlot, timeSlots }: { timeSlot: string; timeSlots: string[] }) {
  return timeSlots.length ? timeSlots : [timeSlot]
}

export function withBookingTimeSlots<T extends { timeSlot: string; timeSlots: string[] }>(row: T) {
  return { ...row, timeSlots: bookingTimeSlots(row) }
}
