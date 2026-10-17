import { BadRequestException, ConflictException } from "@nestjs/common";
import type { ListingPurpose } from "@indanga/db";
import type { PrismaTx } from "src/prisma/prisma.service";

export function validateListingPurpose(
  propertyType: string,
  listingPurpose: ListingPurpose,
  price: number | undefined,
) {
  if (listingPurpose !== "SELL") return;
  if (!["house", "car"].includes(propertyType.trim().toLowerCase())) {
    throw new BadRequestException("Only houses and cars can be listed for sale");
  }
  if (price == null || !Number.isFinite(price) || price <= 0) {
    throw new BadRequestException("A positive selling price is required");
  }
}

export async function assertNoActiveBookings(db: PrismaTx, houseId: string) {
  const activeBooking = await db.booking.findFirst({
    where: {
      houseId,
      status: { in: ["PENDING", "REQUESTED", "AWAITING_PAYMENT", "APPROVED", "CONFIRMED"] },
    },
    select: { id: true },
  });
  if (activeBooking) {
    throw new ConflictException(
      "Resolve active requests and bookings before changing the listing purpose",
    );
  }
}
