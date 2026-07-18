import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { FilterBookingDto, CreateBookingDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";

@Injectable()
export class BookingsService {
  constructor(private readonly db: PrismaService) {}

  async createBooking(clientId: string, data: CreateBookingDto) {
    return this.db.$transaction(async (tx) => {
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
        },
      });

      await tx.house.update({
        where: { id: data.houseId },
        data: { status: HouseStatus.BOOKED },
      });

      return booking;
    });
  }

  async getBookingsByUser(user: UserSession["user"], data: FilterBookingDto) {
    const { page = 1, limit = 20 } = data;
    const where: Prisma.BookingWhereInput = {};
    if (user.role === "TENANT") {
      where.clientId = user.id;
    }
    if (user.role === "LANDLORD") {
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
      user.role === "ADMIN" ||
      (user.role === "TENANT" && booking.clientId === user.id) ||
      (user.role === "LANDLORD" && booking.house.ownerId === user.id);

    if (!canAccessBooking) {
      throw new ForbiddenException("You do not have access to this booking");
    }

    return booking;
  }

}
