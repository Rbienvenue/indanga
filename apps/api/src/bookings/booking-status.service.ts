import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationsService } from "src/notifications/notifications.service";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { getBookingKind } from "src/houses/booking-kind.util";
import { countOverlappingRooms, reservingBookingsWhere } from "./booking-inventory";
import type { UpdateBookingStatusDto } from "./dtos";
import { providerResponseDeadline, unansweredRequestsWhere } from "./booking-deadlines";
const PAYMENT_WINDOW_MS = 30 * 60 * 1000;

@Injectable()
export class BookingStatusService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}
  async updateBookingStatus(id: string, data: UpdateBookingStatusDto, user: UserSession["user"]) {
    const { status } = data;
    const booking = await this.db.booking.findUnique({
      where: { id },
      include: { house: { include: { rooms: true } }, roomType: true, client: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.house.ownerId !== user.id && user.role !== "admin") {
      throw new ForbiddenException("Only the property owner can update booking status");
    }

    if (
      booking.status === BookingStatus.REQUESTED &&
      (status === BookingStatus.AWAITING_PAYMENT || status === BookingStatus.DECLINED)
    ) {
      if (providerResponseDeadline(booking) <= new Date())
        throw new BadRequestException("The provider response deadline has passed");
      if (status === BookingStatus.DECLINED) {
        if (!data.declineReason?.trim())
          throw new BadRequestException("A decline reason is required");
        const claimed = await this.db.booking.updateMany({
          where: { id, status: BookingStatus.REQUESTED, NOT: unansweredRequestsWhere() },
          data: { status: BookingStatus.DECLINED, declineReason: data.declineReason.trim() },
        });
        if (!claimed.count)
          throw new BadRequestException("This booking request has already been handled");
        const declined = await this.db.booking.findUniqueOrThrow({
          where: { id },
          include: { house: true, client: true },
        });
        await this.notifications.create({
          type: "SYSTEM",
          title: "Booking request declined",
          message: `Booking ${declined.bookingId ?? declined.id}: ${declined.house.name} could not accept your request: ${declined.declineReason}. Explore another listing or contact support.`,
          userId: declined.clientId,
          bookingId: declined.id,
        });
        return declined;
      }

      const paymentDeadline = new Date(Date.now() + PAYMENT_WINDOW_MS);
      const accepted = await this.db.$transaction(
        async (tx) => {
          const current = await tx.booking.findUnique({
            where: { id },
            include: { house: true, roomType: true },
          });
          if (!current || current.status !== BookingStatus.REQUESTED) {
            throw new BadRequestException("This booking request has already been handled");
          }
          if (providerResponseDeadline(current) <= new Date())
            throw new BadRequestException("The provider response deadline has passed");
          const kind = getBookingKind(current.house.propertyType);
          if (kind === "hotel") {
            if (!current.roomTypeId || !current.checkIn || !current.checkOut) {
              throw new BadRequestException("This booking request has incomplete stay details");
            }
            const booked = await countOverlappingRooms(
              tx,
              current.roomTypeId,
              current.checkIn,
              current.checkOut,
            );
            const roomCount = current.roomCount ?? 1;
            if (!current.roomType || roomCount > current.roomType.totalRooms - booked) {
              throw new ConflictException("Not enough rooms available for those dates");
            }
          } else if (kind === "car") {
            if (!current.checkIn || !current.checkOut) {
              throw new BadRequestException("This booking request has incomplete rental dates");
            }
            const overlapping = await tx.booking.count({
              where: {
                id: { not: current.id },
                houseId: current.houseId,
                ...reservingBookingsWhere(),
                checkIn: { lt: current.checkOut },
                checkOut: { gt: current.checkIn },
              },
            });
            if (overlapping > 0) {
              throw new ConflictException("Property is already booked for those dates");
            }
          } else {
            const reserved = await tx.booking.count({
              where: {
                id: { not: current.id },
                houseId: current.houseId,
                ...reservingBookingsWhere(),
              },
            });
            if (current.house.status !== HouseStatus.AVAILABLE || reserved > 0) {
              throw new ConflictException("Property is already booked");
            }
          }
          return tx.booking.update({
            where: { id },
            data: { status: BookingStatus.AWAITING_PAYMENT, paymentDeadline },
            include: { house: true, client: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      await this.notifications.create({
        type: "SYSTEM",
        title: "Availability confirmed",
        message: `Booking ${accepted.bookingId ?? accepted.id}: the provider accepted your request. Complete payment by ${paymentDeadline.toLocaleString("en-RW", { timeZone: "Africa/Kigali" })} to secure the booking.`,
        userId: accepted.clientId,
        bookingId: accepted.id,
      });
      return accepted;
    }

    if (status !== BookingStatus.CANCELLED) {
      throw new BadRequestException("This booking status change is not allowed");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const otherCurrentStays = await this.db.booking.count({
      where: {
        houseId: booking.houseId,
        id: { not: booking.id },
        status: { in: [BookingStatus.APPROVED, BookingStatus.CONFIRMED] },
        AND: [
          { OR: [{ checkIn: null }, { checkIn: { lte: today } }] },
          { OR: [{ checkOut: null }, { checkOut: { gte: today } }] },
        ],
      },
    });

    const updated = await this.db.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status },
        include: { house: true, client: true },
      });

      // Room-based hotels free capacity via dates; only flip whole-property listings.
      if (otherCurrentStays === 0 && booking.house.rooms.length === 0) {
        await tx.house.update({
          where: { id: booking.houseId },
          data: { status: HouseStatus.AVAILABLE },
        });
      }

      return updated;
    });

    await this.notifications.create({
      type: "BOOKING_CANCELLED",
      title: "Booking cancelled",
      message: `Booking ${updated.bookingId ?? updated.id} for ${updated.house.name} was cancelled. Review your payment history and contact support about refund eligibility.`,
      userId: updated.clientId,
      bookingId: updated.id,
    });

    return updated;
  }
}
