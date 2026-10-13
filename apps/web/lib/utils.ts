import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(amount: number | string, currency: string) {
  const formattedAmount = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  });
  return currency === "USD" ? `$${formattedAmount}` : `${currency} ${formattedAmount}`;
}

export function formatBookingTotal(booking: {
  totalAmount?: number | null;
  currency?: string | null;
  serviceFee?: number | null;
  serviceFeeCurrency?: string | null;
  house: { currency?: string | null };
}) {
  const currency = booking.currency ?? booking.house.currency ?? "RWF";
  const amount = formatCurrency(booking.totalAmount ?? 0, currency);
  const fee = booking.serviceFee ?? 0;
  return booking.serviceFeeCurrency === "RWF" && currency === "USD" && fee > 0
    ? `${amount} + ${formatCurrency(fee, "RWF")}`
    : amount;
}
