import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    role: z.enum(["tenant", "landlord"], { message: "Select a role" }),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
    // Rwanda national ID is 16 digits; optional for tenant, required for landlord.
    nationalId: z.string().trim().optional(),
    email: z.email("Enter a valid email address"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    const nationalIdTrimmed = values.nationalId?.trim() ?? "";
    if (values.role === "landlord") {
      if (!nationalIdTrimmed || nationalIdTrimmed.length < 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid national ID/Passport",
          path: ["nationalId"],
        });
      }
    } else if (nationalIdTrimmed.length > 0 && nationalIdTrimmed.length < 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid national ID/Passport",
        path: ["nationalId"],
      });
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
