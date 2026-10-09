import { Injectable } from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationsService } from "src/notifications/notifications.service";
import { env } from "src/lib/env";

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function currentStay(today: Date): Prisma.BookingWhereInput {
  return {
    status: { in: [BookingStatus.APPROVED, BookingStatus.CONFIRMED] },
    AND: [
      { OR: [{ checkIn: null }, { checkIn: { lte: today } }] },
      { OR: [{ checkOut: null }, { checkOut: { gte: today } }] },
    ],
  };
}

@Injectable()
export class CronService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async expireBookings() {
    const completed = await this.completeExpiredBookings();
    const paymentExpired = await this.expirePaymentDeadlines();
    const staleCancelled = await this.cancelStalePendingBookings();
    const { markedBooked, markedAvailable } = await this.reconcileHouseAvailability();
    return { completed, paymentExpired, staleCancelled, markedBooked, markedAvailable };
  }

  private async completeExpiredBookings(): Promise<number> {
    const today = startOfTodayUTC();
    const expired = await this.db.booking.findMany({
      where: {
        status: { in: [BookingStatus.APPROVED, BookingStatus.CONFIRMED] },
        checkOut: { lt: today },
      },
      select: { id: true, houseId: true, clientId: true },
    });

    let count = 0;
    for (const booking of expired) {
      const full = await this.db.booking.findUnique({
        where: { id: booking.id },
        include: { house: { include: { rooms: true } }, client: true },
      });
      if (
        !full ||
        (full.status !== BookingStatus.APPROVED && full.status !== BookingStatus.CONFIRMED)
      ) {
        continue;
      }

      const stillActive = await this.db.booking.count({
        where: {
          houseId: full.houseId,
          status: { in: [BookingStatus.APPROVED, BookingStatus.CONFIRMED] },
          id: { not: full.id },
          OR: [{ checkOut: null }, { checkOut: { gte: today } }],
        },
      });

      const updated = await this.db.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
          where: { id: full.id },
          data: { status: BookingStatus.COMPLETED },
          include: { house: true, client: true },
        });
        if (stillActive === 0 && full.house.rooms.length === 0) {
          await tx.house.update({
            where: { id: full.houseId },
            data: { status: HouseStatus.AVAILABLE },
          });
        }
        return updatedBooking;
      });

      await this.notifications.create({
        type: "BOOKING_COMPLETED",
        title: "Booking completed",
        message: `Booking ${updated.bookingId ?? updated.id} for ${updated.house.name} has ended. Review your payment history and contact support if you have an unresolved issue.`,
        userId: updated.clientId,
        bookingId: updated.id,
      });
      await this.notifications.create({
        type: "BOOKING_COMPLETED",
        title: "Booking completed",
        message: `Booking ${updated.bookingId ?? updated.id}: ${updated.client.name} booking for ${updated.house.name} has ended. Contact support if there is an unresolved issue.`,
        userId: updated.house.ownerId,
        bookingId: updated.id,
      });

      count += 1;
    }
    return count;
  }

  private async expirePaymentDeadlines(): Promise<number> {
    const where: Prisma.BookingWhereInput = {
      status: BookingStatus.AWAITING_PAYMENT,
      OR: [{ paymentDeadline: { lte: new Date() } }, { paymentDeadline: null }],
    };
    const expired = await this.db.booking.findMany({
      where,
      include: { house: true },
    });

    let count = 0;
    for (const booking of expired) {
      const updated = await this.db.booking.updateMany({
        where: { ...where, id: booking.id },
        data: { status: BookingStatus.EXPIRED },
      });
      if (updated.count === 0) continue;
      count += 1;
      await this.notifications.create({
        type: "BOOKING_CANCELLED",
        title: "Booking request expired",
        message: `Booking ${booking.bookingId ?? booking.id}: the payment deadline for ${booking.house.name} has passed. Explore another listing. If you made a payment, contact support.`,
        userId: booking.clientId,
        bookingId: booking.id,
      });
    }

    return count;
  }

  private async reconcileHouseAvailability(): Promise<{
    markedBooked: number;
    markedAvailable: number;
  }> {
    const today = startOfTodayUTC();
    const stay = currentStay(today);

    // Room-based hotels manage capacity per room type; only flip whole-property listings.
    const wholeProperty = { rooms: { none: {} } };
    const toBook = await this.db.house.findMany({
      where: { status: HouseStatus.AVAILABLE, bookings: { some: stay }, ...wholeProperty },
      select: { id: true },
    });
    const toFree = await this.db.house.findMany({
      where: { status: HouseStatus.BOOKED, bookings: { none: stay }, ...wholeProperty },
      select: { id: true },
    });

    if (toBook.length > 0) {
      await this.db.house.updateMany({
        where: { id: { in: toBook.map((h) => h.id) } },
        data: { status: HouseStatus.BOOKED },
      });
    }
    if (toFree.length > 0) {
      await this.db.house.updateMany({
        where: { id: { in: toFree.map((h) => h.id) } },
        data: { status: HouseStatus.AVAILABLE },
      });
    }

    return { markedBooked: toBook.length, markedAvailable: toFree.length };
  }

  private async cancelStalePendingBookings(): Promise<number> {
    const cutoff = new Date(Date.now() - env.STALE_PENDING_HOURS * 60 * 60 * 1000);
    const stale = await this.db.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        createdAt: { lt: cutoff },
      },
      include: { house: true, client: true },
    });

    let count = 0;
    for (const booking of stale) {
      const updated = await this.db.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED },
          include: { house: true, client: true },
        });
        await tx.payment.updateMany({
          where: { bookingId: booking.id, status: "PENDING" },
          data: { status: "FAILED" },
        });
        return updatedBooking;
      });

      await this.notifications.create({
        type: "BOOKING_CANCELLED",
        title: "Booking cancelled",
        message: `Booking ${updated.bookingId ?? updated.id} for ${updated.house.name} expired before payment was completed. Explore another listing or contact support if you made a payment.`,
        userId: updated.clientId,
        bookingId: updated.id,
      });

      count += 1;
    }
    return count;
  }
}
