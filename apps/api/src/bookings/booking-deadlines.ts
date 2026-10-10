import type { Prisma } from "@indanga/db";

// Confirm this window with providers before changing it.
export const PROVIDER_RESPONSE_HOURS = 24;
export const PROVIDER_RESPONSE_MS = PROVIDER_RESPONSE_HOURS * 60 * 60 * 1000;

export function providerResponseDeadline(booking: {
  responseDeadline: Date | null;
  createdAt: Date;
}): Date {
  return booking.responseDeadline ?? new Date(booking.createdAt.getTime() + PROVIDER_RESPONSE_MS);
}

export function unansweredRequestsWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    status: "REQUESTED",
    OR: [
      { responseDeadline: { lte: now } },
      {
        responseDeadline: null,
        createdAt: { lte: new Date(now.getTime() - PROVIDER_RESPONSE_MS) },
      },
    ],
  };
}
