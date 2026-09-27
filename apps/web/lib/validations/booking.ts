import { differenceInCalendarDays, startOfDay } from "date-fns";
import { z } from "zod";

export const gateways = ["momo", "airtel", "card"] as const;
export type Gateway = (typeof gateways)[number];

const mobileMoneyGateways: Gateway[] = ["momo", "airtel"];

export const bookingSchema = z
  .object({
    houseId: z.string().min(1),
    gateway: z.enum(gateways, { message: "Select a payment method" }),
    phone: z.string().optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    roomTypeId: z.string().optional(),
    roomCount: z.coerce.number<number>().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!mobileMoneyGateways.includes(data.gateway)) return;

    if (!data.phone || data.phone.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required for mobile money",
      });
      return;
    }

    const digits = data.phone.replace(/\D/g, "");
    if (!/^(2507[2-9]\d{7}|07[2-9]\d{7})$/.test(digits)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid Rwandan phone number",
      });
    }
  });

export type BookingValues = z.infer<typeof bookingSchema>;

export function requiresPhone(gateway: Gateway): boolean {
  return mobileMoneyGateways.includes(gateway);
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export const datedBookingSchema = bookingSchema
  .safeExtend({
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
  })
  .superRefine((data, ctx) => {
    const checkIn = parseLocalDate(data.checkIn);
    const checkOut = parseLocalDate(data.checkOut);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "Enter valid check-in and check-out dates",
      });
      return;
    }
    if (startOfDay(checkIn) < startOfDay(new Date())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkIn"],
        message: "Check-in date cannot be in the past",
      });
    }
    if (differenceInCalendarDays(checkOut, checkIn) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "Check-out date must be after check-in date",
      });
    }
  });

export type DatedBookingValues = z.infer<typeof datedBookingSchema>;

export const hotelBookingSchema = datedBookingSchema.safeExtend({
  roomTypeId: z.string().min(1, "Select a room type"),
  roomCount: z.coerce.number<number>().int().min(1, "Select at least 1 room"),
});

export type HotelBookingValues = z.infer<typeof hotelBookingSchema>;

export function getNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const nights = differenceInCalendarDays(end, start);
  return nights > 0 ? nights : 0;
}
