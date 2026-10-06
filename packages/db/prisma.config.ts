import "dotenv/config";

import { defineConfig } from "prisma/config";

// `prisma generate` is codegen-only and never connects to the database, so it
// must work without a real DATABASE_URL (e.g. Vercel builds where the var is
// absent). Commands that touch the database (db push, migrate) will still fail
// loudly against this placeholder if the var is missing.
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/indanga-placeholder";

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
