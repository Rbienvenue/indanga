import type { BookingKind } from "@/lib/booking-kind";

export type ServiceFeeType = "percentage" | "fixed";

export type ServiceFee = {
  bookingKind: BookingKind;
  feeType: ServiceFeeType;
  amount: number;
  isActive: boolean;
};

export const DEFAULT_SERVICE_FEE: ServiceFee = {
  bookingKind: "home",
  feeType: "percentage",
  amount: 5,
  isActive: true,
};

export function calcServiceFee(subtotal: number, fee?: ServiceFee | null): number {
  const config = fee ?? DEFAULT_SERVICE_FEE;
  if (!config.isActive || subtotal <= 0) return 0;
  if (config.feeType === "fixed") return Math.max(Math.round(config.amount), 0);
  return Math.round(subtotal * (config.amount / 100));
}

export function getServiceFeeLabel(fee?: ServiceFee | null): string {
  const config = fee ?? DEFAULT_SERVICE_FEE;
  if (!config.isActive) return "Service fee (Free)";
  if (config.feeType === "fixed") return "Service fee";
  return `Service fee (${config.amount}%)`;
}
