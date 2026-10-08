import { Injectable } from "@nestjs/common";
import { Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { FilterGuestsDto } from "./dtos";

const bookingSelect = {
  id: true,
  bookingId: true,
  status: true,
  createdAt: true,
  checkIn: true,
  checkOut: true,
  nights: true,
  roomCount: true,
  house: { select: { id: true, name: true } },
  roomType: { select: { name: true } },
} satisfies Prisma.BookingSelect;

@Injectable()
export class GuestsService {
  constructor(private readonly db: PrismaService) {}

  async getGuests(ownerId: string, query: FilterGuestsDto) {
    const { page = 1, limit = 20, houseId } = query;
    const search = query.search?.trim();
    const bookingWhere: Prisma.BookingWhereInput = { house: { ownerId }, houseId };
    const where: Prisma.UserWhereInput = {
      bookings: { some: bookingWhere },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [guests, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          image: true,
          _count: { select: { bookings: { where: bookingWhere } } },
          bookings: {
            where: bookingWhere,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 1,
            select: bookingSelect,
          },
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: guests.map(({ _count, bookings, ...guest }) => ({
        ...guest,
        bookingCount: _count.bookings,
        latestBooking: bookings[0] ?? null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProperties(ownerId: string) {
    return this.db.house.findMany({
      where: { ownerId },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
    });
  }

  async getGuestBookings(ownerId: string, clientId: string, query: FilterGuestsDto) {
    const { page = 1, limit = 20, houseId } = query;
    const where: Prisma.BookingWhereInput = { clientId, house: { ownerId }, houseId };
    const [bookings, total] = await Promise.all([
      this.db.booking.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: bookingSelect,
      }),
      this.db.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
