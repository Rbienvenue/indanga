import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto, FilterPaymentsDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "node:crypto";
import { NotificationsService } from "src/notifications/notifications.service";
import { ITECService } from "./itec";
import { WsGateway } from "src/ws/ws.gateway";
import { getBookingKind, isDatedProperty } from "src/houses/booking-kind.util";
import { countOverlappingRooms } from "src/houses/houses.service";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function differenceInCalendarDays(end: Date, start: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay);
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly itec: ITECService,
    private readonly ws: WsGateway,
  ) {}
  async initiatePayment(clientId: string, data: CreateOrderDto) {
    const { booking, payment, result } = await this.db.$transaction(
      async (tx) => {
        const house = await tx.house.findUnique({ where: { id: data.houseId } });
        if (!house) {
          throw new NotFoundException("Property not found");
        }
        const dated = isDatedProperty(house.propertyType);
        if (!dated && house.status !== HouseStatus.AVAILABLE) {
          throw new ConflictException("Property is already booked");
        }

        let checkIn: Date | undefined;
        let checkOut: Date | undefined;
        let nights: number | undefined;
        let roomTypeId: string | undefined;
        let roomCount = 1;
        let unitPrice: number | undefined;
        const isHotel = getBookingKind(house.propertyType) === "hotel";
        if (house.price == null && !isHotel) {
          throw new BadRequestException("This property has no price set");
        }
        let amount = house.price ?? 0;

        if (dated) {
          if (!data.checkIn || !data.checkOut) {
            throw new BadRequestException("Check-in and check-out dates are required");
          }          checkIn = new Date(data.checkIn);
          checkOut = new Date(data.checkOut);
          if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            throw new BadRequestException("Invalid check-in or check-out date");
          }
          const today = startOfDay(new Date());
          if (startOfDay(checkIn) < today) {
            throw new BadRequestException("Check-in date cannot be in the past");
          }
          if (startOfDay(checkOut) <= startOfDay(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
          }
          nights = differenceInCalendarDays(checkOut, checkIn);
          if (nights < 1) {
            throw new BadRequestException("Check-out date must be after check-in date");
          }
          if (isHotel) {
            if (!data.roomTypeId) {
              throw new BadRequestException("Selecting a room type is required for hotels");
            }
            roomCount = data.roomCount ?? 1;
            if (!Number.isInteger(roomCount) || roomCount < 1) {
              throw new BadRequestException("Room count must be at least 1");
            }
            const room = await tx.roomType.findUnique({ where: { id: data.roomTypeId } });
            if (!room || room.houseId !== house.id) {
              throw new BadRequestException("Selected room type is not part of this hotel");
            }
            const booked = await countOverlappingRooms(tx, room.id, checkIn, checkOut);
            if (roomCount > room.totalRooms - booked) {
              throw new ConflictException("Not enough rooms available for those dates");
            }
            roomTypeId = room.id;
            unitPrice = room.price;
            amount = room.price * roomCount * nights;
          } else {
            const overlapping = await tx.booking.count({
              where: {
                houseId: house.id,
                status: BookingStatus.APPROVED,
                checkIn: { lt: checkOut },
                checkOut: { gt: checkIn },
              },
            });
            if (overlapping > 0) {
              throw new ConflictException("Property is already booked for those dates");
            }
            amount = (house.price ?? 0) * nights;
          }
        }

        const booking = await tx.booking.create({
          data: {
            clientId,
            houseId: data.houseId,
            status: BookingStatus.PENDING,
            checkIn,
            checkOut,
            nights,
            roomTypeId,
            roomCount: isHotel ? roomCount : undefined,
            unitPrice: nights ? (unitPrice ?? house.price ?? undefined) : undefined,
            totalAmount: amount,
          },
          include: {
            house: true,
            client: true,
          },
        });

        const payment = await tx.payment.create({
          data: {
            amount,
            bookingId: booking.id,
            status: "PENDING",
            method: data.method,
            transactionReference: randomUUID(),
          },
        });

        const result = await this.itec.initiatePayment({
          id: payment.transactionReference,
          amount: Number(payment.amount),
          phone: data.phone,
          method: data.method,
        });
        const savedPayment =
          data.method === "CARD" && "PCODE" in result
            ? await tx.payment.update({
                where: { transactionReference: payment.transactionReference },
                data: { transactionReference: result.PCODE },
              })
            : payment;

        return { booking, payment: savedPayment, result };
      },
      { timeout: 10_000 },
    );

    return {
      id: payment.id,
      amount: Number(payment.amount),
      phone: data.phone,
      method: data.method,
      nights: booking.nights ?? undefined,
      unitPrice: booking.unitPrice ?? undefined,
      roomTypeId: booking.roomTypeId ?? undefined,
      roomCount: booking.roomCount ?? undefined,
      checkIn: booking.checkIn ?? undefined,
      checkOut: booking.checkOut ?? undefined,
      ...result,
    };
  }
  async checkPaymentStatus(transactionReference: string) {
    const payment = await this.db.payment.findFirst({
      where: { transactionReference },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    const booking = await this.db.booking.findFirst({
      where: { id: payment.bookingId },
      include: { house: true, client: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    if (payment.status !== "PENDING") return payment;
    //ITEC deletes failed transactions
    let result: Awaited<ReturnType<ITECService["checkPaymentStatus"]>>;
    try {
      result = await this.itec.checkPaymentStatus(transactionReference);
    } catch (error) {
      console.error(error);
      if (!(error instanceof BadRequestException) || !/no transaction found/i.test(error.message)) {
        throw error;
      }
      return this.markPaymentFailed(payment, booking, transactionReference);
    }
    console.log(result);

    const status = result.data.status;

    if (status === "FAILED") {
      return this.markPaymentFailed(payment, booking, transactionReference);
    }

    if (status === "SUCCESSFUL") {
      const stayStarted =
        !booking.checkIn || startOfDay(booking.checkIn).getTime() <= startOfDay(new Date()).getTime();
      // Hotels manage capacity per room type over dates; never flip the whole hotel.
      const isHotel = getBookingKind(booking.house.propertyType) === "hotel";
      await this.db.$transaction(async (tx) => {
        await tx.payment.update({ where: { transactionReference }, data: { status: "COMPLETED" } });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.APPROVED },
        });
        if (stayStarted && !isHotel) {
          await tx.house.update({
            where: { id: booking.houseId },
            data: { status: HouseStatus.BOOKED },
          });
        }
      });
      this.ws.emitPaymentUpdate(payment.id, "successful");

      await this.notifications.create({
        userId: booking.house.ownerId,
        type: "BOOKING_CONFIRMED",
        title: "New booking confirmed",
        message: `${booking.client.name} booked ${booking.house.name}.`,
        bookingId: booking.id,
      });
      await this.notifications.create({
        userId: booking.client.id,
        type: "BOOKING_CONFIRMED",
        title: "Booking confirmed",
        message: `You booked ${booking.house.name}.`,
        bookingId: booking.id,
      });
      return { ...payment, status: "COMPLETED" as const };
    }

    this.ws.emitPaymentUpdate(payment.id, "pending");
    return payment;
  }

  private async markPaymentFailed(
    payment: Prisma.PaymentGetPayload<{}>,
    booking: Prisma.BookingGetPayload<{ include: { house: true; client: true } }>,
    transactionReference: string,
  ) {
    await this.db.$transaction(async (tx) => {
      await tx.payment.update({ where: { transactionReference }, data: { status: "FAILED" } });
      await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    });
    this.ws.emitPaymentUpdate(payment.id, "failed");
    return { ...payment, status: "FAILED" as const };
  }

  async getPayments(user: UserSession["user"], data: FilterPaymentsDto) {
    const { page = 1, limit = 20, status } = data;
    const where: Prisma.PaymentWhereInput = {};

    if (status) where.status = status;

    if (user.role === "tenant") {
      where.booking = { clientId: user.id };
    }

    if (user.role === "landlord") {
      where.booking = { house: { ownerId: user.id } };
    }

    const [payments, total] = await Promise.all([
      this.db.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          booking: {
            include: { house: true, roomType: true, client: true },
          },
        },
      }),
      this.db.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
