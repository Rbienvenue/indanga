import { z } from "zod";
const envSchema = z.object({
  NODE_ENV:z.string().optional().default("development"),
  PORT:z.coerce.number<number>().default(5000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  FRONTEND_URL:z.url().default("http://localhost:3000"),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.url().optional(),
  S3_BUCKET: z.string().optional(),
  STORAGE_URL: z.url().optional(),
})
export const env=envSchema.parse(process.env)
