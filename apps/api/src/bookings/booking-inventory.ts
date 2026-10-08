import { BookingStatus, type Prisma } from "@indanga/db";
import type { PrismaTx } from "src/prisma/prisma.service";

/** Payment holds reserve inventory only until their deadline, independently of cron. */
export function reservingBookingsWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: { in: [BookingStatus.APPROVED, BookingStatus.CONFIRMED] } },
      { status: BookingStatus.AWAITING_PAYMENT, paymentDeadline: { gt: now } },
    ],
  };
}

/** Rooms booked for a room type overlapping [checkIn, checkOut). */
export async function countOverlappingRooms(
  db: PrismaTx,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const bookings = await db.booking.findMany({
    where: {
      roomTypeId,
      AND: [
        reservingBookingsWhere(),
        { OR: [{ checkIn: null }, { checkIn: { lt: checkOut } }] },
        { OR: [{ checkOut: null }, { checkOut: { gt: checkIn } }] },
      ],
    },
    select: { roomCount: true },
  });
  return bookings.reduce((sum, booking) => sum + (booking.roomCount ?? 1), 0);
}
