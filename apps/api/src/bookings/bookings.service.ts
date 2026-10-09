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
import { CalendarBookingDto, CreateBookingDto, FilterBookingDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { getBookingKind, type BookingKind } from "src/houses/booking-kind.util";
import { countOverlappingRooms, reservingBookingsWhere } from "./booking-inventory";
import { ServiceFeesService } from "src/service-fees/service-fees.service";
import { calcServiceFee } from "src/service-fees/service-fee.util";

import type { User } from "src/lib/auth";
import {
  PROVIDER_RESPONSE_MS,
  providerResponseDeadline,
  unansweredRequestsWhere,
} from "./booking-deadlines";

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
            ...reservingBookingsWhere(),
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
        responseDeadline: new Date(Date.now() + PROVIDER_RESPONSE_MS),
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
      message: `Booking ${booking.bookingId ?? booking.id}: ${booking.client.name} requested ${booking.house.name}. Accept or decline by ${providerResponseDeadline(booking).toLocaleString("en-RW", { timeZone: "Africa/Kigali" })} in your dashboard.`,
      userId: booking.house.ownerId,
      bookingId: booking.id,
    });

    return booking;
  }

  async getActiveBooking(clientId: string, houseId: string) {
    if (!houseId) throw new BadRequestException("Property is required");
    const booking = await this.db.booking.findFirst({
      where: {
        clientId,
        houseId,
        OR: [
          { status: BookingStatus.REQUESTED, NOT: unansweredRequestsWhere() },
          reservingBookingsWhere(),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { house: true, roomType: true },
    });
    return booking ? { ...booking, responseDeadline: providerResponseDeadline(booking) } : null;
  }

  async getBookingsByUser(user: UserSession["user"], data: FilterBookingDto) {
    const { page = 1, limit = 20 } = data;
    const where: Prisma.BookingWhereInput = {};
    if (data.status) where.status = data.status;
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
      data: bookings.map((booking) => ({
        ...booking,
        responseDeadline: providerResponseDeadline(booking),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCalendar(user: User, query: CalendarBookingDto) {
    if (user.role !== "landlord" || user.providerType !== "HOTEL") {
      throw new ForbiddenException("The calendar is available to hotel providers only");
    }
    const start = new Date(query.start);
    const end = new Date(query.end);
    const date = new Date(query.date);
    const dayMs = 24 * 60 * 60 * 1000;
    if (
      [start, end, date].some((value) => Number.isNaN(value.getTime())) ||
      end <= start ||
      end.getTime() - start.getTime() > 62 * dayMs ||
      date < start ||
      date >= end
    ) {
      throw new BadRequestException("Select a valid calendar range and a date within it");
    }
    const properties = (
      await this.db.house.findMany({
        where: { ownerId: user.id },
        select: {
          id: true,
          name: true,
          propertyType: true,
          rooms: { select: { id: true, name: true, totalRooms: true }, orderBy: { price: "asc" } },
        },
        orderBy: { name: "asc" },
      })
    ).filter((property) => getBookingKind(property.propertyType) === "hotel");
    const now = new Date();
    const bookings = await this.db.booking.findMany({
      where: {
        houseId: { in: properties.map((property) => property.id) },
        checkIn: { lt: end },
        checkOut: { gt: start },
        OR: [
          { status: { in: [BookingStatus.REQUESTED, BookingStatus.COMPLETED] } },
          reservingBookingsWhere(now),
        ],
      },
      orderBy: { checkIn: "asc" },
      select: {
        id: true,
        bookingId: true,
        houseId: true,
        roomTypeId: true,
        roomCount: true,
        status: true,
        checkIn: true,
        checkOut: true,
        paymentDeadline: true,
        totalAmount: true,
        client: { select: { name: true, email: true } },
        roomType: { select: { name: true } },
        house: { select: { name: true } },
      },
    });
    const nextDay = new Date(date.getTime() + dayMs);
    const inventory = properties.map((property) => ({
      id: property.id,
      name: property.name,
      rooms: property.rooms.map((room) => {
        let bookedRooms = 0;
        let heldRooms = 0;
        for (const booking of bookings) {
          if (
            booking.roomTypeId !== room.id ||
            !booking.checkIn ||
            !booking.checkOut ||
            booking.checkIn >= nextDay ||
            booking.checkOut <= date
          )
            continue;
          if (booking.status === BookingStatus.AWAITING_PAYMENT)
            heldRooms += booking.roomCount ?? 1;
          if (
            booking.status === BookingStatus.CONFIRMED ||
            booking.status === BookingStatus.APPROVED
          ) {
            bookedRooms += booking.roomCount ?? 1;
          }
        }
        return {
          ...room,
          bookedRooms,
          heldRooms,
          availableRooms: Math.max(0, room.totalRooms - bookedRooms - heldRooms),
        };
      }),
    }));
    return { properties: inventory, bookings };
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
}
