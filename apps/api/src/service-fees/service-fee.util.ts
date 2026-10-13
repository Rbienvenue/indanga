import { Currency, type Prisma, type FeeType } from "@indanga/db";

export type BookingKind = "home" | "hotel" | "car";

export const BOOKING_KINDS: BookingKind[] = ["home", "hotel", "car"];

export type ServiceFeeConfig = {
  feeType: FeeType;
  amount: number;
  isActive: boolean;
};

export const DEFAULT_SERVICE_FEE: ServiceFeeConfig = {
  feeType: "percentage",
  amount: 5,
  isActive: true,
};

export function normalizeBookingKind(value?: string | null): BookingKind {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "hotel" || normalized === "car" || normalized === "home") {
    return normalized;
  }
  return "home";
}

export function calcServiceFee(
  subtotal: number,
  fee: ServiceFeeConfig,
  currency: Currency = Currency.RWF,
): number {
  if (!fee.isActive || subtotal <= 0) return 0;
  if (fee.feeType === "fixed") return Math.max(Math.round(fee.amount), 0);
  const precision = currency === Currency.USD ? 100 : 1;
  return Math.round((Math.round(subtotal * precision) * fee.amount) / 100) / precision;
}

export function getPaymentServiceFeeRwf(payment: {
  serviceFeeAmount: Prisma.Decimal | null;
  exchangeRate: Prisma.Decimal | null;
  booking: { serviceFee: Prisma.Decimal | null };
}): number {
  if (payment.serviceFeeAmount != null) return Number(payment.serviceFeeAmount);
  return Math.round(Number(payment.booking.serviceFee ?? 0) * Number(payment.exchangeRate ?? 1));
}
