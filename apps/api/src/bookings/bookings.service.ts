import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationsService } from "src/notifications/notifications.service";
import { FilterBookingDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getBookingsByUser(user: UserSession["user"], data: FilterBookingDto) {
    const { page = 1, limit = 20 } = data;
    const where: Prisma.BookingWhereInput = {};
    if (user.role === "tenant") {
      where.clientId = user.id;
    }
    if (user.role === "landlord") {
      where.house = { ownerId: user.id };
    }

    const [bookings, total] = await Promise.all([
      this.db.booking.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          house: true,
          client: true,
        },
      }),
      this.db.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingById(id: string, user: UserSession["user"]) {
    const booking = await this.db.booking.findUnique({
      where: { id },
      include: {
        house: true,
        client: true,
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const canAccessBooking =
      user.role === "admin" ||
      (user.role === "tenant" && booking.clientId === user.id) ||
      (user.role === "landlord" && booking.house.ownerId === user.id);

    if (!canAccessBooking) {
      throw new ForbiddenException("You do not have access to this booking");
    }

    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus, user: UserSession["user"]) {
    if (status !== BookingStatus.CANCELLED) {
      throw new BadRequestException("Only cancellation is allowed");
    }

    const booking = await this.db.booking.findUnique({
      where: { id },
      include: { house: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.house.ownerId !== user.id && user.role !== "admin") {
      throw new ForbiddenException("Only the property owner can update booking status");
    }

    const updated = await this.db.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status },
        include: { house: true, client: true },
      });

      await tx.house.update({
        where: { id: booking.houseId },
        data: { status: HouseStatus.AVAILABLE },
      });

      return updated;
    });

    await this.notifications.create({
      type: "BOOKING_CANCELLED",
      title: "Booking cancelled",
      message: `Your booking for ${updated.house.name} was cancelled.`,
      userId: updated.clientId,
      bookingId: updated.id,
    });

    return updated;
  }
}
