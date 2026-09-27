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
    status: BookingStatus.APPROVED,
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
    const staleCancelled = await this.cancelStalePendingBookings();
    const { markedBooked, markedAvailable } = await this.reconcileHouseAvailability();
    return { completed, staleCancelled, markedBooked, markedAvailable };
  }

  private async completeExpiredBookings(): Promise<number> {
    const today = startOfTodayUTC();
    const expired = await this.db.booking.findMany({
      where: {
        status: BookingStatus.APPROVED,
        checkOut: { lt: today },
      },
      select: { id: true, houseId: true, clientId: true },
    });

    let count = 0;
    for (const booking of expired) {
      const full = await this.db.booking.findUnique({
        where: { id: booking.id },
        include: { house: true, client: true },
      });
      if (!full || full.status !== BookingStatus.APPROVED) continue;

      const stillActive = await this.db.booking.count({
        where: {
          houseId: full.houseId,
          status: BookingStatus.APPROVED,
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
        if (stillActive === 0) {
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
        message: `Your booking for ${updated.house.name} has ended.`,
        userId: updated.clientId,
        bookingId: updated.id,
      });
      await this.notifications.create({
        type: "BOOKING_COMPLETED",
        title: "Booking completed",
        message: `${updated.client.name} booking for ${updated.house.name} has ended.`,
        userId: updated.house.ownerId,
        bookingId: updated.id,
      });

      count += 1;
    }
    return count;
  }

  private async reconcileHouseAvailability(): Promise<{
    markedBooked: number;
    markedAvailable: number;
  }> {
    const today = startOfTodayUTC();
    const stay = currentStay(today);

    const toBook = await this.db.house.findMany({
      where: { status: HouseStatus.AVAILABLE, bookings: { some: stay } },
      select: { id: true },
    });
    const toFree = await this.db.house.findMany({
      where: { status: HouseStatus.BOOKED, bookings: { none: stay } },
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
        message: `Your booking for ${updated.house.name} expired before payment was completed.`,
        userId: updated.clientId,
        bookingId: updated.id,
      });

      count += 1;
    }
    return count;
  }
}
