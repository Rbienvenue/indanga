import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationsService } from "src/notifications/notifications.service";
import { FilterBookingDto, CreateBookingDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";

function getBookingStatusNotification(status: BookingStatus, houseName: string) {
  switch (status) {
    case BookingStatus.APPROVED:
      return {
        type: "BOOKING_CONFIRMED" as const,
        title: "Booking approved",
        message: `Your booking for ${houseName} was approved.`,
      };
    case BookingStatus.REJECTED:
      return {
        type: "BOOKING_CANCELLED" as const,
        title: "Booking rejected",
        message: `Your booking for ${houseName} was rejected.`,
      };
    case BookingStatus.CANCELLED:
      return {
        type: "BOOKING_CANCELLED" as const,
        title: "Booking cancelled",
        message: `Your booking for ${houseName} was cancelled.`,
      };
    default:
      return null;
  }
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createBooking(clientId: string, data: CreateBookingDto) {
    const booking = await this.db.$transaction(async (tx) => {
      const house = await tx.house.findUnique({ where: { id: data.houseId } });

      if (!house) {
        throw new NotFoundException("House not found");
      }

      if (house.status !== HouseStatus.AVAILABLE) {
        throw new ConflictException("House is already booked");
      }

      const booking = await tx.booking.create({
        data: {
          clientId,
          houseId: data.houseId,
        },
        include: {
          house: true,
          client: true,
        },
      });

      await tx.house.update({
        where: { id: data.houseId },
        data: { status: HouseStatus.BOOKED },
      });

      return booking;
    });

    await this.notifications.create({
      userId: booking.house.ownerId,
      type: "BOOKING_CREATED",
      title: "New booking request",
      message: `${booking.client.name} requested to book ${booking.house.name}.`,
      bookingId: booking.id,
    });

    return booking;
  }

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

      if (status === BookingStatus.REJECTED || status === BookingStatus.CANCELLED) {
        await tx.house.update({
          where: { id: booking.houseId },
          data: { status: HouseStatus.AVAILABLE },
        });
      }

      return updated;
    });

    const notification = getBookingStatusNotification(status, updated.house.name);
    if (notification) {
      await this.notifications.create({
        ...notification,
        userId: updated.clientId,
        bookingId: updated.id,
      });
    }

    return updated;
  }
}
