import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateServiceFeeDto } from "./dtos";
import {
  BOOKING_KINDS,
  DEFAULT_SERVICE_FEE,
  normalizeBookingKind,
  type BookingKind,
} from "./service-fee.util";

@Injectable()
export class ServiceFeesService {
  constructor(private readonly db: PrismaService) {}

  async getAll() {
    const rows = await this.db.serviceFee.findMany();
    const byKind = new Map(rows.map((row) => [row.bookingKind, row]));
    // No seed: missing kinds fall back to the default so checkout never breaks.
    return BOOKING_KINDS.map((bookingKind) =>
      byKind.get(bookingKind) ?? { bookingKind, ...DEFAULT_SERVICE_FEE },
    );
  }

  async getByKind(kind: string) {
    const bookingKind: BookingKind = normalizeBookingKind(kind);
    const row = await this.db.serviceFee.findUnique({ where: { bookingKind } });
    return row ?? { bookingKind, ...DEFAULT_SERVICE_FEE };
  }

  async upsert(kind: string, data: UpdateServiceFeeDto) {
    const bookingKind = normalizeBookingKind(kind);
    if (data.feeType === "percentage" && data.amount > 100) {
      throw new BadRequestException("Percentage fee cannot exceed 100");
    }
    // Upsert: re-saving an existing kind only updates the config.
    // Existing bookings keep their snapshot (booking.serviceFee) and are unaffected.
    return this.db.serviceFee.upsert({
      where: { bookingKind },
      create: { bookingKind, ...data },
      update: { ...data },
    });
  }
}
