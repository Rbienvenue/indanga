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
import { CreateBookingDto, FilterBookingDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { getBookingKind, type BookingKind } from "src/houses/booking-kind.util";
import { countOverlappingRooms } from "src/houses/houses.service";
import { ServiceFeesService } from "src/service-fees/service-fees.service";
import { calcServiceFee } from "src/service-fees/service-fee.util";

const PAYMENT_WINDOW_MS = 30 * 60 * 1000;

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function differenceInCalendarDays(end: Date, start: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay);
}

function createBookingId(kind: BookingKind, now = new Date()): string {
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 100_000)).padStart(5, "0");
  const prefix = kind === "hotel" ? "HTL" : kind === "car" ? "CAR" : "HOM";
  return `IND-${prefix}-${year}${month}${random}`;
}

const RESERVING_STATUSES = [
  BookingStatus.APPROVED,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.CONFIRMED,
];

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly serviceFees: ServiceFeesService,
  ) {}

  async createBookingRequest(clientId: string, data: CreateBookingDto) {
    const house = await this.db.house.findUnique({
      where: { id: data.houseId },
      include: { rooms: true },
    });
    if (!house) throw new NotFoundException("Property not found");
    const bookingKind = getBookingKind(house.propertyType);
    const isDated = bookingKind !== "home";
    let checkIn: Date | undefined;
    let checkOut: Date | undefined;
    let nights: number | undefined;
    let roomTypeId: string | undefined;
    let roomCount: number | undefined;
    let unitPrice: number | undefined;

    if (isDated) {
      if (!data.checkIn || !data.checkOut) {
        throw new BadRequestException("Check-in and check-out dates are required");
      }
      checkIn = new Date(data.checkIn);
      checkOut = new Date(data.checkOut);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        throw new BadRequestException("Invalid check-in or check-out date");
      }
      if (startOfDay(checkIn) < startOfDay(new Date())) {
        throw new BadRequestException("Check-in date cannot be in the past");
      }
      nights = differenceInCalendarDays(checkOut, checkIn);
      if (nights < 1) {
        throw new BadRequestException("Check-out date must be after check-in date");
      }
    }

    let subtotal: number;
    if (bookingKind === "hotel") {
      if (!data.roomTypeId) {
        throw new BadRequestException("Selecting a room type is required for hotels");
      }
      roomCount = data.roomCount ?? 1;
      const room = house.rooms.find((item) => item.id === data.roomTypeId);
      if (!room) throw new BadRequestException("Selected room type is not part of this hotel");
      const booked = await countOverlappingRooms(this.db, room.id, checkIn!, checkOut!);
      if (roomCount > room.totalRooms - booked) {
        throw new ConflictException("Not enough rooms available for those dates");
      }
      roomTypeId = room.id;
      unitPrice = room.price;
      subtotal = room.price * roomCount * nights!;
    } else {
      if (house.price == null) throw new BadRequestException("This property has no price set");
      unitPrice = house.price;
      if (bookingKind === "car") {
        const overlapping = await this.db.booking.count({
          where: {
            houseId: house.id,
            status: { in: RESERVING_STATUSES },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        });
        if (overlapping > 0) {
          throw new ConflictException("Property is already booked for those dates");
        }
        subtotal = house.price * nights!;
      } else {
        if (house.status !== HouseStatus.AVAILABLE) {
          throw new ConflictException("Property is already booked");
        }
        subtotal = house.price;
      }
    }

    const feeConfig = await this.serviceFees.getByKind(bookingKind);
    const serviceFee = calcServiceFee(subtotal, feeConfig);
    const booking = await this.db.booking.create({
      data: {
        bookingId: createBookingId(bookingKind),
        clientId,
        houseId: house.id,
        roomTypeId,
        roomCount,
        status: BookingStatus.REQUESTED,
        checkIn,
        checkOut,
        nights,
        unitPrice,
        serviceFee,
        totalAmount: subtotal + serviceFee,
      },
      include: { house: true, roomType: true, client: true },
    });

    await this.notifications.create({
      type: "BOOKING_CREATED",
      title: "New booking request",
      message: `${booking.client.name} sent a booking request for ${booking.house.name}.`,
      userId: booking.house.ownerId,
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
          house: { include: { rooms: true } },
          roomType: true,
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
        house: { include: { rooms: true } },
        roomType: true,
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
      if (status === BookingStatus.DECLINED) {
        const declined = await this.db.booking.update({
          where: { id },
          data: { status: BookingStatus.DECLINED },
          include: { house: true, client: true },
        });
        await this.notifications.create({
          type: "SYSTEM",
          title: "Booking request declined",
          message: `${declined.house.name} could not accept your booking request.`,
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
                status: { in: RESERVING_STATUSES },
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
                status: { in: RESERVING_STATUSES },
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
        message: `The provider accepted your request. Complete payment by ${paymentDeadline.toLocaleString("en-RW", { timeZone: "Africa/Kigali" })} to secure the booking.`,
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
      message: `Your booking for ${updated.house.name} was cancelled.`,
      userId: updated.clientId,
      bookingId: updated.id,
    });

    return updated;
  }
}
