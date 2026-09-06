import { z } from "zod";

export const kycSubmitSchema = z.object({
  document: z
    .array(z.instanceof(File))
    .min(1, "Upload your ID document")
    .max(1, "Only one document is allowed"),
});

export type KycSubmitValues = z.infer<typeof kycSubmitSchema>;

export const kycRejectSchema = z.object({
  reason: z.string().trim().min(4, "Reason must be at least 4 characters"),
});

export type KycRejectValues = z.infer<typeof kycRejectSchema>;
