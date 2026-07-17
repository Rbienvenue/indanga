import { betterAuth} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@indanga/db";
import { env } from "./env";

export const auth=betterAuth({
    appName: "ScriptyLabs",
    secret: env.BETTER_AUTH_SECRET,
    debug: true,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/v1/auth",
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      env.FRONTEND_URL
    ],
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    user: {
      additionalFields: {
        phoneNumber: {
          type: "string",
          required: true,
          input: true,
        },
      },
    },
    account: {
      accountLinking: {
        trustedProviders: [
          "google",
          "github",
          "apple",
          "gitlab",
          "email-password",
        ],
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
