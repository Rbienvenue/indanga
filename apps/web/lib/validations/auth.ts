import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

const NATIONAL_ID_PATTERN = /^\d{16}$/;

function refineNationalId(values: { role: string; nationalId?: string }, ctx: z.RefinementCtx) {
  const nationalId = values.nationalId?.trim() ?? "";
  if (values.role === "landlord" || nationalId.length > 0) {
    if (!NATIONAL_ID_PATTERN.test(nationalId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "National ID must be exactly 16 digits",
        path: ["nationalId"],
      });
    }
  }
}

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
    password: z.string().min(8, "Password must be at least 8 characters"),
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

    refineNationalId(values, ctx);
  });

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the user's full name"),
    email: z.email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["tenant", "landlord", "admin"], { message: "Select a role" }),
    // Required for landlords (matches signup), optional otherwise.
    nationalId: z.string().trim().optional(),
  })
  .superRefine(refineNationalId);

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
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
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
