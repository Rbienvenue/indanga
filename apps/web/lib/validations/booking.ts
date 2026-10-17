import { differenceInCalendarDays, startOfDay } from "date-fns";
import { z } from "zod";

export const bookingSchema = z.object({
  houseId: z.string().min(1, "validation.property"),
  months: z.coerce
    .number<number>({ error: "validation.positiveInteger" })
    .int("validation.positiveInteger")
    .min(1, "validation.months")
    .optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  roomTypeId: z.string().optional(),
  roomCount: z.coerce
    .number<number>({ error: "validation.positiveInteger" })
    .int("validation.positiveInteger")
    .min(1, "validation.positiveInteger")
    .optional(),
  guestCount: z.coerce
    .number<number>({ error: "validation.positiveInteger" })
    .int("validation.positiveInteger")
    .min(1, "validation.positiveInteger")
    .optional(),
});

export type BookingValues = z.infer<typeof bookingSchema>;

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export const datedBookingSchema = bookingSchema
  .safeExtend({
    checkIn: z.string().min(1, "validation.checkIn"),
    checkOut: z.string().min(1, "validation.checkOut"),
  })
  .superRefine((data, ctx) => {
    const checkIn = parseLocalDate(data.checkIn);
    const checkOut = parseLocalDate(data.checkOut);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "validation.validDates",
      });
      return;
    }
    if (startOfDay(checkIn) < startOfDay(new Date())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkIn"],
        message: "validation.pastCheckIn",
      });
    }
    if (differenceInCalendarDays(checkOut, checkIn) < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "validation.afterCheckIn",
      });
    }
  });

export type DatedBookingValues = z.infer<typeof datedBookingSchema>;

export const hotelBookingSchema = datedBookingSchema.safeExtend({
  roomTypeId: z.string().min(1, "validation.roomType"),
  guestCount: z.coerce
    .number<number>({ error: "validation.positiveInteger" })
    .int("validation.positiveInteger")
    .min(1, "validation.guests"),
  roomCount: z.coerce
    .number<number>({ error: "validation.positiveInteger" })
    .int("validation.positiveInteger")
    .min(1, "validation.rooms"),
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
