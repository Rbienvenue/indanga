import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto, FilterPaymentsDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "node:crypto";
import { NotificationsService } from "src/notifications/notifications.service";
import { ITECService } from "./itec";

@Injectable()
export class PaymentsService {
  constructor(private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly itec: ITECService,
  ) { }
  async initiatePayment(clientId: string, data: CreateOrderDto) {

    const { booking, payment, result } = await this.db.$transaction(async (tx) => {
      const house = await tx.house.findUnique({ where: { id: data.houseId } });
      if (!house) {
        throw new NotFoundException("Property not found");
      }
      if (house.status !== HouseStatus.AVAILABLE) {
        throw new ConflictException("Property is already booked");
      }

      const booking = await tx.booking.create({
        data: {
          clientId,
          houseId: data.houseId,
          status: BookingStatus.APPROVED,
        },
        include: {
          house: true,
          client: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          amount: house.price,
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
      //TODO: save the PCODE if payment method is CARD
      await tx.house.update({
        where: { id: data.houseId },
        data: { status: HouseStatus.BOOKED },
      });

      return { booking, payment, result };
    }, { timeout: 10_000 });

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

    return {
      id: payment.id,
      amount: Number(payment.amount),
      phone: data.phone,
      method: data.method,
      ...result,
    };
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
            include: { house: true, client: true },
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
