import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto, FilterPaymentsDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "node:crypto";
import { NotificationsService } from "src/notifications/notifications.service";
import { ITECService } from "./itec";
import { WsGateway } from "src/ws/ws.gateway";

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
        if (house.status !== HouseStatus.AVAILABLE) {
          throw new ConflictException("Property is already booked");
        }

        const booking = await tx.booking.create({
          data: {
            clientId,
            houseId: data.houseId,
            status: BookingStatus.PENDING,
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

        return { booking, payment, result };
      },
      { timeout: 10_000 },
    );

    if (data.method !== "CARD") {
      void this.monitorPayment(payment.id, payment.transactionReference);
    }

    return {
      id: payment.id,
      amount: Number(payment.amount),
      phone: data.phone,
      method: data.method,
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
    const result = await this.itec.checkPaymentStatus(transactionReference);
    const status = result.data.status;

    if (status === "FAILED") {
      await this.db.$transaction(async (tx) => {
        await tx.payment.update({ where: { transactionReference }, data: { status: "FAILED" } });
        await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
      });
      this.ws.emitPaymentUpdate(payment.id, "failed");
      return { ...payment, status: "FAILED" as const };
    }

    if (status === "SUCCESSFULL") {
      await this.db.$transaction(async (tx) => {
        await tx.payment.update({ where: { transactionReference }, data: { status: "COMPLETED" } });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.APPROVED },
        });
        await tx.house.update({
          where: { id: booking.houseId },
          data: { status: HouseStatus.BOOKED },
        });
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

  private async monitorPayment(paymentId: string, transactionReference: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      try {
        const payment = await this.checkPaymentStatus(transactionReference);
        if (payment.status !== "PENDING") return;
      } catch {
        continue;
      }
    }
    this.ws.emitPaymentUpdate(paymentId, "pending");
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
