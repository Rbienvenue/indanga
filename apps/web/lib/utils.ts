import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatPrice(price: number | string) {
  return `${Math.round(Number(price)).toLocaleString("en-US")} RWF`;
}
