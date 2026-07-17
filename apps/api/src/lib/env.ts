import { z } from "zod";
const envSchema = z.object({
  NODE_ENV:z.string().optional().default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  FRONTEND_URL:z.url()
})
export const env=envSchema.parse(process.env)
