import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, HouseStatus, Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrderDto, FilterPaymentsDto } from "./dtos";
import { type UserSession } from "@thallesp/nestjs-better-auth";
import { randomUUID } from "node:crypto";
import { NotificationsService } from "src/notifications/notifications.service";

@Injectable()
export class PaymentsService {
  constructor(private readonly db: PrismaService,
    private readonly notifications: NotificationsService,
  ) { }
  async initiatePayment(clientId: string, data: CreateOrderDto) {

    const house = await this.db.house.findUnique({ where: { id: data.houseId } });
    if (!house) {
      throw new NotFoundException("Property not found");
    }
    if (house.status !== HouseStatus.AVAILABLE) {
      throw new ConflictException("Property is already booked");
    }

    const booking = await this.db.booking.create({
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

    const payment= await this.db.payment.create({
      data: {
          amount: house.price,
          bookingId: booking.id,
         // TODO: set to pending
          status: "COMPLETED",
          method: "direct",
          transactionReference: `TXN-${randomUUID()}`,
        }
      });
    await this.db.house.update({
      where: { id: data.houseId },
      data: { status: HouseStatus.BOOKED },
    });
   // TODO: send admin notifications
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
    
    return payment;
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
