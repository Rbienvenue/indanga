import { z } from "zod";
const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number<number>().default(5000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  STORAGE_ACCESS_KEY_ID: z.string().default("123"),
  STORAGE_SECRET_ACCESS_KEY: z.string().default("456"),
  S3_ENDPOINT: z.url().default("https://url.com"),
  S3_BUCKET: z.string().default("2"),
  STORAGE_URL: z.url().default("https://url.com"),
});
export const env = envSchema.parse(process.env);
