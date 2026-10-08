import { z } from "zod";

export const messageSchema = z.object({
  text: z.string().trim().min(1, "Write a message").max(4000, "Use 4,000 characters or fewer"),
});
export type MessageValues = z.infer<typeof messageSchema>;
