import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { CardPaymentCallbackDto, CreateOrderDto, FilterPaymentsDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "node:crypto";
import { NotificationsService } from "src/notifications/notifications.service";
import { ITECService } from "./itec";
import { WsGateway } from "src/ws/ws.gateway";
import { getBookingKind } from "src/houses/booking-kind.util";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
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
    return this.initiateAcceptedBookingPayment(clientId, data.bookingId, data);
  }

  private async initiateAcceptedBookingPayment(
    clientId: string,
    bookingId: string,
    data: CreateOrderDto,
  ) {
    const existing = await this.db.booking.findFirst({
      where: { id: bookingId, clientId },
      select: { id: true, status: true, paymentDeadline: true },
    });
    if (!existing) throw new NotFoundException("Booking not found");
    if (
      existing.status === BookingStatus.AWAITING_PAYMENT &&
      (!existing.paymentDeadline || existing.paymentDeadline <= new Date())
    ) {
      await this.db.booking.updateMany({
        where: {
          id: existing.id,
          status: BookingStatus.AWAITING_PAYMENT,
          OR: [{ paymentDeadline: { lte: new Date() } }, { paymentDeadline: null }],
        },
        data: { status: BookingStatus.EXPIRED },
      });
      throw new BadRequestException("The payment deadline has passed");
    }

    const { booking, payment, result } = await this.db.$transaction(
      async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { house: true, client: true },
        });
        if (!booking || booking.clientId !== clientId) {
          throw new NotFoundException("Booking not found");
        }
        if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
          throw new BadRequestException("This booking is not awaiting payment");
        }
        if (!booking.paymentDeadline || booking.paymentDeadline <= new Date()) {
          throw new BadRequestException("The payment deadline has passed");
        }
        if (booking.totalAmount == null) {
          throw new BadRequestException("This booking has no payment amount");
        }
        const activePayment = await tx.payment.findFirst({
          where: { bookingId: booking.id, status: { in: ["PENDING", "COMPLETED"] } },
        });
        if (activePayment?.status === "COMPLETED") {
          throw new BadRequestException("This booking has already been paid");
        }
        if (activePayment) {
          throw new ConflictException("A payment is already pending for this booking");
        }

        const payment = await tx.payment.create({
          data: {
            amount: booking.totalAmount,
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
  async handleCardCallback(body: CardPaymentCallbackDto) {
    const payment = await this.db.payment.findFirst({
      where: { transactionReference: body.PCODE },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.method !== "CARD") {
      throw new BadRequestException("Invalid callback for payment method");
    }
    const booking = await this.db.booking.findFirst({
      where: { id: payment.bookingId },
      include: { house: true, client: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (payment.status !== "PENDING") return payment;
    if (Number(body.amount) !== Number(payment.amount)) {
      throw new BadRequestException("Amount mismatch");
    }
    return this.markPaymentSuccessful(payment, booking, body.PCODE);
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
    // Card has no MOMO status API; leave PENDING until card webhook arrives.
    if (payment.method === "CARD") {
      this.ws.emitPaymentUpdate(payment.id, "pending");
      return payment;
    }
    // ITEC deletes failed mobile transactions
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
    const status = result.data.status;
    if (status === "FAILED") {
      return this.markPaymentFailed(payment, booking, transactionReference);
    }
    if (status === "SUCCESSFUL") {
      return this.markPaymentSuccessful(payment, booking, transactionReference);
    }
    this.ws.emitPaymentUpdate(payment.id, "pending");
    return payment;
  }

  private async markPaymentSuccessful(
    payment: Prisma.PaymentGetPayload<{}>,
    booking: Prisma.BookingGetPayload<{ include: { house: true; client: true } }>,
    transactionReference: string,
  ) {
    const outcome = await this.db.$transaction(
      async (tx) => {
        // Claim the pending payment once so duplicate callbacks cannot repeat booking changes.
        const updated = await tx.payment.updateMany({
          where: { transactionReference, status: "PENDING" },
          data: { status: "COMPLETED" },
        });
        if (updated.count === 0) return null;
        const current = await tx.booking.findUniqueOrThrow({ where: { id: booking.id } });
        const now = new Date();
        const canConfirm =
          current.status === BookingStatus.AWAITING_PAYMENT &&
          current.paymentDeadline != null &&
          current.paymentDeadline > now;
        if (!canConfirm) {
          // The money was received, but released inventory must never be reserved again here.
          if (current.status === BookingStatus.AWAITING_PAYMENT) {
            await tx.booking.update({
              where: { id: current.id },
              data: { status: BookingStatus.EXPIRED },
            });
          }
          return "review";
        }
        await tx.booking.update({
          where: { id: current.id },
          data: { status: BookingStatus.CONFIRMED },
        });
        const stayStarted = !current.checkIn || startOfDay(current.checkIn) <= startOfDay(now);
        if (stayStarted && getBookingKind(booking.house.propertyType) !== "hotel") {
          await tx.house.update({
            where: { id: current.houseId },
            data: { status: HouseStatus.BOOKED },
          });
        }
        return "confirmed";
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if (outcome === null) {
      return this.db.payment.findUniqueOrThrow({ where: { transactionReference } });
    }
    this.ws.emitPaymentUpdate(payment.id, "successful");
    if (outcome === "review") {
      await this.notifications.create({
        userId: booking.house.ownerId,
        type: "SYSTEM",
        title: "Payment needs review",
        message: `${booking.client.name} paid for a booking that is no longer reserved. Review payment ${payment.id}; the booking was not confirmed.`,
        bookingId: booking.id,
        paymentId: payment.id,
      });
      await this.notifications.create({
        userId: booking.client.id,
        type: "SYSTEM",
        title: "Payment received; booking not confirmed",
        message: `Your payment for ${booking.house.name} arrived after the reservation closed. Contact support to arrange a refund or a new booking.`,
        bookingId: booking.id,
        paymentId: payment.id,
      });
    } else {
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
    }
    return { ...payment, status: "COMPLETED" as const };
  }

  private async markPaymentFailed(
    payment: Prisma.PaymentGetPayload<{}>,
    booking: Prisma.BookingGetPayload<{ include: { house: true; client: true } }>,
    transactionReference: string,
  ) {
    const changed = await this.db.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: { transactionReference, status: "PENDING" },
        data: { status: "FAILED" },
      });
      if (updated.count === 0) return false;
      await tx.booking.updateMany({
        where: {
          id: booking.id,
          status: BookingStatus.AWAITING_PAYMENT,
          OR: [{ paymentDeadline: { lte: new Date() } }, { paymentDeadline: null }],
        },
        data: { status: BookingStatus.EXPIRED },
      });
      return true;
    });
    if (!changed) {
      return this.db.payment.findUniqueOrThrow({ where: { transactionReference } });
    }
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
            select: {
              id: true,
              bookingId: true,
              checkIn: true,
              checkOut: true,
              nights: true,
              serviceFee: true,
              house: { select: { id: true, name: true, propertyType: true } },
              client: { select: { name: true, email: true } },
            },
          },
        },
      }),
      this.db.payment.count({ where }),
    ]);

    return {
      data: payments.map((payment) => ({
        ...payment,
        bookingAmount: payment.amount.toNumber() - (payment.booking.serviceFee ?? 0),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProviderPaymentStats(ownerId: string) {
    const payments = await this.db.payment.findMany({
      where: { booking: { house: { ownerId } }, status: { in: ["COMPLETED", "PENDING"] } },
      select: { amount: true, status: true, booking: { select: { serviceFee: true } } },
    });
    return payments.reduce(
      (totals, payment) => {
        if (payment.status === "COMPLETED") {
          totals.earnings += payment.amount.toNumber() - (payment.booking.serviceFee ?? 0);
          totals.completedPayments += 1;
        } else {
          totals.pendingPayments += 1;
        }
        return totals;
      },
      { earnings: 0, completedPayments: 0, pendingPayments: 0 },
    );
  }
}
