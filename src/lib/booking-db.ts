import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export function bookingDay(day: string) {
  return { gte: new Date(`${day}T00:00:00Z`), lte: new Date(`${day}T23:59:59.999Z`) }
}

export function findBookingConflict(
  tx: Prisma.TransactionClient,
  day: string,
  slots: string[],
  excludeId?: string,
) {
  return tx.booking.findFirst({
    where: {
      date: bookingDay(day),
      status: { not: 'rejected' },
      id: excludeId ? { not: excludeId } : undefined,
      OR: [{ timeSlots: { hasSome: slots } }, { timeSlot: { in: slots } }],
    },
    select: { id: true },
  })
}

export async function bookingTransaction<T>(action: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(action, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
    } catch (error) {
      if (
        attempt >= 2 ||
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2034'
      ) {
        throw error
      }
    }
  }
}
