import { z } from "zod";

export const gateways = ["momo", "airtel", "card"] as const;
export type Gateway = (typeof gateways)[number];

const mobileMoneyGateways: Gateway[] = ["momo", "airtel"];

export const bookingSchema = z
  .object({
    houseId: z.string().min(1),
    gateway: z.enum(gateways, { message: "Select a payment method" }),
    phone: z.string().optional(),
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
