import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("validation.email"),
  password: z.string().min(5, "validation.passwordFive"),
});

const NATIONAL_ID_PATTERN = /^\d{16}$/;

function refineNationalId(values: { role: string; nationalId?: string }, ctx: z.RefinementCtx) {
  const nationalId = values.nationalId?.trim() ?? "";
  if (values.role === "landlord" || nationalId.length > 0) {
    if (!NATIONAL_ID_PATTERN.test(nationalId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.nationalId",
        path: ["nationalId"],
      });
    }
  }
}

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(2, "validation.firstName"),
    lastName: z.string().trim().min(2, "validation.lastName"),
    role: z.enum(["tenant", "landlord"], { message: "validation.role" }),
    providerType: z.enum(["HOUSE", "HOTEL", "CAR"]),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "validation.phone"),
    // Rwanda national ID is 16 digits; optional for tenant, required for landlord.
    nationalId: z.string().trim().optional(),
    email: z.email("validation.email"),
    password: z.string().min(8, "validation.passwordEight"),
    confirmPassword: z.string().min(1, "validation.confirmPassword"),
    termsAccepted: z.boolean().refine((accepted) => accepted, {
      message: "validation.acceptTerms",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.passwordMatch",
        path: ["confirmPassword"],
      });
    }

    refineNationalId(values, ctx);
  });

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "validation.fullName"),
    email: z.email("validation.email"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "validation.phone"),
    password: z.string().min(8, "validation.passwordEight"),
    role: z.enum(["tenant", "landlord", "admin"], { message: "validation.role" }),
    providerType: z.enum(["HOUSE", "HOTEL", "CAR"]),
    // Required for landlords (matches signup), optional otherwise.
    nationalId: z.string().trim().optional(),
  })
  .superRefine(refineNationalId);

export const editUserSchema = z
  .object({
    name: createUserSchema.shape.name,
    email: createUserSchema.shape.email,
    phoneNumber: createUserSchema.shape.phoneNumber,
    role: createUserSchema.shape.role,
    nationalId: createUserSchema.shape.nationalId,
  })
  .superRefine(refineNationalId);

export const forgotPasswordSchema = z.object({
  email: z.email("validation.email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(5, "validation.passwordFive"),
    confirmPassword: z.string().min(1, "validation.confirmPassword"),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.passwordMatch",
        path: ["confirmPassword"],
      });
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

/**
 * Joins the split registration name fields back into the single `name`
 * value stored on the user record (schema unchanged). Trims surrounding
 * whitespace and collapses any internal runs of whitespace to one space.
 */
export function combineFullName(firstName: string, lastName: string): string {
  const clean = (value: string) => value.trim().replace(/\s+/g, " ");
  return `${clean(firstName)} ${clean(lastName)}`.trim();
}
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues = z.infer<typeof editUserSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
