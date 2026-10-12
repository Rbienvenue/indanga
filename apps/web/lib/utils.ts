import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(amount: number | string, currency: string) {
  const formattedAmount = Math.round(Number(amount)).toLocaleString("en-US");
  return currency === "USD" ? `$${formattedAmount}` : `${currency} ${formattedAmount}`;
}
