import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@indanga/db";
import { env } from "./env";

export const auth = betterAuth({
  appName: "ScriptyLabs",
  secret: env.BETTER_AUTH_SECRET,
  debug: true,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/v1/auth",
  trustedOrigins: [env.BETTER_AUTH_URL, env.FRONTEND_URL,"https://www.indanga.com"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    admin({
      defaultRole: "tenant",
      adminRoles: ["admin"],
    }),
  ],
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: true,
        input: true,
      },
      nationalId: {
        type: "string",
        required: false,
        input: true,
        returned: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(_user, ctx) {
          const accountType = (ctx?.body as { accountType?: unknown } | undefined)?.accountType;

          if (accountType !== undefined && accountType !== "tenant" && accountType !== "landlord") {
            throw APIError.from("BAD_REQUEST", {
              message: "Invalid account type",
              code: "INVALID_ACCOUNT_TYPE",
            });
          }

          return {
            data: {
              role: accountType === "landlord" ? "landlord" : "tenant",
            },
          };
        },
      },
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["google", "github", "apple", "gitlab", "email-password"],
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
