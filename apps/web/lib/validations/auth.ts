import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "Enter a valid phone number"),
    // Rwanda national ID is 16 digits; keep flexible enough for formatting edges.
    nationalId: z
      .string()
      .trim()
      .regex(/^[0-9]{16}$/, "Enter a valid 16-digit national ID"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
