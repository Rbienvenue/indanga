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
    const isPurchase = house.listingPurpose === "SELL";
    const bookingKind = getBookingKind(house.propertyType);
    const isDated = !isPurchase && bookingKind !== "home";
    const months = !isPurchase && bookingKind === "home" ? (data.months ?? 1) : undefined;
    let checkIn: Date | undefined;
    let checkOut: Date | undefined;
    let nights: number | undefined;
    let roomTypeId: string | undefined;
    let roomCount: number | undefined;
    let guestCount: number | undefined;
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
    if (isPurchase) {
      if (house.status !== HouseStatus.AVAILABLE) {
        throw new ConflictException("This property is not available for purchase");
      }
      if (house.price == null) throw new BadRequestException("This property has no price set");
      const reserved = await this.db.booking.count({
        where: { houseId: house.id, ...reservingBookingsWhere() },
      });
      if (reserved > 0)
        throw new ConflictException("This property is reserved for another customer");
      unitPrice = Number(house.price);
      subtotal = unitPrice;
    } else if (bookingKind === "hotel") {
      if (!data.roomTypeId) {
        throw new BadRequestException("Selecting a room type is required for hotels");
      }
      roomCount = data.roomCount ?? 1;
      const room = house.rooms.find((item) => item.id === data.roomTypeId);
      if (!room) throw new BadRequestException("Selected room type is not part of this hotel");
      guestCount = data.guestCount ?? 1;
      if (guestCount > room.capacity * roomCount) {
        throw new BadRequestException("Guest count exceeds the selected rooms’ capacity");
      }
      const booked = await countOverlappingRooms(this.db, room.id, checkIn!, checkOut!);
      if (roomCount > room.totalRooms - booked) {
        throw new ConflictException("Not enough rooms available for those dates");
      }
      roomTypeId = room.id;
      unitPrice = Number(room.price);
      subtotal = unitPrice * roomCount * nights!;
    } else {
      if (house.price == null) throw new BadRequestException("This property has no price set");
      unitPrice = Number(house.price);
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
        subtotal = unitPrice * nights!;
      } else {
        if (house.status !== HouseStatus.AVAILABLE) {
          throw new ConflictException("Property is already booked");
        }
        subtotal = unitPrice * months!;
      }
    }

    const feeConfig = await this.serviceFees.getByKind(bookingKind);
    const serviceFee = calcServiceFee(subtotal, feeConfig, house.currency);
    const cautionFee = isPurchase || bookingKind === "hotel" ? 0 : Number(house.cautionFee ?? 0);
    const serviceFeeCurrency = feeConfig.feeType === "fixed" ? "RWF" : house.currency;
    const total =
      Math.round(
        (subtotal + cautionFee + (serviceFeeCurrency === house.currency ? serviceFee : 0)) * 100,
      ) / 100;
    const booking = await this.db.booking.create({
      data: {
        bookingId: createBookingId(bookingKind),
        listingPurpose: house.listingPurpose,
        clientId,
        houseId: house.id,
        roomTypeId,
        roomCount,
        guestCount,
        status: BookingStatus.REQUESTED,
        responseDeadline: new Date(Date.now() + PROVIDER_RESPONSE_MS),
        checkIn,
        checkOut,
        nights,
        months,
        unitPrice,
        serviceFee,
        serviceFeeType: feeConfig.feeType,
        serviceFeeCurrency,
        cautionFee,
        currency: house.currency,
        totalAmount: total,
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
          { listingPurpose: "SELL", status: BookingStatus.COMPLETED },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { house: true, roomType: true },
    });
    return booking ? { ...booking, responseDeadline: providerResponseDeadline(booking) } : null;
  }

  async getTenantStats(clientId: string) {
    const [favorites, activeBookings, payments, reviews] = await Promise.all([
      this.db.favorite.count({ where: { userId: clientId } }),
      this.db.booking.count({
        where: {
          clientId,
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.REQUESTED,
              BookingStatus.AWAITING_PAYMENT,
              BookingStatus.APPROVED,
              BookingStatus.CONFIRMED,
            ],
          },
        },
      }),
      this.db.payment.count({ where: { booking: { clientId } } }),
      this.db.review.count({ where: { tenantId: clientId } }),
    ]);

    return { favorites, activeBookings, payments, reviews };
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
          payments: {
            where: { status: "COMPLETED" },
            select: { id: true },
            orderBy: { createdAt: "desc" },
          },
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
    if (
      user.role !== "landlord" ||
      (user.providerType !== "HOTEL" && user.providerType !== "CAR")
    ) {
      throw new ForbiddenException("The calendar is available to hotel and car providers only");
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
    const kind = user.providerType === "CAR" ? "car" : "hotel";
    const properties = (
      await this.db.house.findMany({
        where: { ownerId: user.id, listingPurpose: "RENT" },
        select: {
          id: true,
          name: true,
          propertyType: true,
          rooms: { select: { id: true, name: true, totalRooms: true }, orderBy: { price: "asc" } },
        },
        orderBy: { name: "asc" },
      })
    ).filter((property) => getBookingKind(property.propertyType) === kind);
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
        currency: true,
        serviceFee: true,
        serviceFeeCurrency: true,
        client: { select: { name: true, email: true } },
        roomType: { select: { name: true } },
        house: { select: { name: true, currency: true } },
      },
    });
    const nextDay = new Date(date.getTime() + dayMs);
    const isCarCalendar = kind === "car";
    const inventory = properties.map((property) => {
      const rooms = property.rooms.map((room) => {
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
      });
      const dayBookings = isCarCalendar
        ? bookings.filter(
            (booking) =>
              booking.houseId === property.id &&
              booking.checkIn &&
              booking.checkOut &&
              booking.checkIn < nextDay &&
              booking.checkOut > date,
          )
        : [];
      // Each car listing is a single vehicle, so the day status is binary.
      const carBooked = dayBookings.some(
        (booking) =>
          booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.APPROVED,
      );
      const carHeld =
        !carBooked &&
        dayBookings.some((booking) => booking.status === BookingStatus.AWAITING_PAYMENT);
      const totalUnits = isCarCalendar ? 1 : rooms.reduce((sum, room) => sum + room.totalRooms, 0);
      const bookedUnits = isCarCalendar
        ? carBooked
          ? 1
          : 0
        : rooms.reduce((sum, room) => sum + room.bookedRooms, 0);
      const heldUnits = isCarCalendar
        ? carHeld
          ? 1
          : 0
        : rooms.reduce((sum, room) => sum + room.heldRooms, 0);
      return {
        id: property.id,
        name: property.name,
        rooms,
        dayAvailability: {
          total: totalUnits,
          booked: bookedUnits,
          held: heldUnits,
          available: Math.max(0, totalUnits - bookedUnits - heldUnits),
        },
      };
    });
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

    return {
      ...booking,
      payments: booking.payments.map((payment) => ({
        ...payment,
        checkoutUrl: booking.clientId === user.id ? payment.checkoutUrl : null,
      })),
    };
  }
}
