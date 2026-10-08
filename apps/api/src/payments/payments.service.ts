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
      await this.db.booking.update({
        where: { id: existing.id },
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
    const stayStarted =
      !booking.checkIn || startOfDay(booking.checkIn).getTime() <= startOfDay(new Date()).getTime();
    // Hotels manage capacity per room type over dates; never flip the whole hotel.
    const isHotel = getBookingKind(booking.house.propertyType) === "hotel";
    await this.db.$transaction(async (tx) => {
      await tx.payment.update({ where: { transactionReference }, data: { status: "COMPLETED" } });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status:
            booking.status === BookingStatus.AWAITING_PAYMENT
              ? BookingStatus.CONFIRMED
              : BookingStatus.APPROVED,
        },
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

  private async markPaymentFailed(
    payment: Prisma.PaymentGetPayload<{}>,
    booking: Prisma.BookingGetPayload<{ include: { house: true; client: true } }>,
    transactionReference: string,
  ) {
    await this.db.$transaction(async (tx) => {
      await tx.payment.update({ where: { transactionReference }, data: { status: "FAILED" } });
      const canRetry =
        booking.status === BookingStatus.AWAITING_PAYMENT &&
        booking.paymentDeadline != null &&
        booking.paymentDeadline > new Date();
      if (booking.status === BookingStatus.AWAITING_PAYMENT) {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: canRetry ? BookingStatus.AWAITING_PAYMENT : BookingStatus.EXPIRED,
          },
        });
      } else if (booking.status === BookingStatus.PENDING) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED },
        });
      }
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
