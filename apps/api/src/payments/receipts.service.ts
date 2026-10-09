import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";
import { getBookingKind } from "src/houses/booking-kind.util";

@Injectable()
export class ReceiptsService {
  constructor(private readonly db: PrismaService) {}

  async getReceipt(id: string, user: UserSession["user"]) {
    const payment = await this.db.payment.findFirst({
      where: {
        id,
        ...(user.role === "admin"
          ? {}
          : {
              booking: {
                OR: [
                  { clientId: user.id },
                  ...(user.role === "landlord" ? [{ house: { ownerId: user.id } }] : []),
                ],
              },
            }),
      },
      include: {
        booking: { include: { client: true, house: { include: { owner: true } }, roomType: true } },
      },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "COMPLETED")
      throw new BadRequestException("Receipts are available for successful payments only");
    const booking = payment.booking;
    const total = Number(payment.amount);
    const serviceFee = booking.serviceFee ?? 0;
    const kind = getBookingKind(booking.house.propertyType);
    const period =
      booking.checkIn && booking.checkOut
        ? `${booking.checkIn.toLocaleDateString("en-GB", { timeZone: "Africa/Kigali" })} - ${booking.checkOut.toLocaleDateString("en-GB", { timeZone: "Africa/Kigali" })}`
        : "Monthly rent";
    return {
      id: payment.id,
      bookingReference: booking.bookingId ?? booking.id,
      bookingStatus: booking.status,
      issuedAt: payment.updatedAt.toISOString(),
      method: payment.method,
      transactionReference: payment.transactionReference,
      customer: {
        name: booking.client.name,
        email: booking.client.email,
        phone: booking.client.phoneNumber,
      },
      provider: booking.house.owner.name,
      description: `${booking.house.name}${booking.roomType ? ` · ${booking.roomType.name} × ${booking.roomCount ?? 1}` : ""}`,
      period,
      rate: booking.unitPrice,
      duration: kind === "home" ? 1 : booking.nights,
      quantity: kind === "hotel" ? (booking.roomCount ?? 1) : 1,
      unit: kind === "car" ? "day" : kind === "hotel" ? "night" : "month",
      subtotal: total - serviceFee,
      serviceFee,
      total,
      amountPaid: total,
      currency: "RWF",
    };
  }
}

export type Receipt = Awaited<ReturnType<ReceiptsService["getReceipt"]>>;
