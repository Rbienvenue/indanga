import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, emailOTP } from "better-auth/plugins";
import { prisma } from "@indanga/db";
import { sendEmail } from "../email/mail";
import ForgotPasswordEmail from "../email/templates/forgot-password";
import { renderToString } from "../email/render";
import { env } from "./env";

export const auth = betterAuth({
  appName: "Indanga",
  secret: env.BETTER_AUTH_SECRET,
  debug: true,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/v1/auth",
  trustedOrigins: [env.BETTER_AUTH_URL, env.FRONTEND_URL, "https://www.indanga.com"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    admin({
      defaultRole: "tenant",
      adminRoles: ["admin"],
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 5 * 60,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") return;
        const user = await prisma.user.findUnique({
          where: { email },
          select: { name: true },
        });
        const html = await renderToString(ForgotPasswordEmail, {
          name: user?.name ?? "there",
          otp,
        });
        await sendEmail({ to: email, subject: "Reset your password", html });
      },
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
      kycStatus: {
        type: "string",
        required: false,
        input: false,
      },
      providerType: {
        type: ["HOUSE", "HOTEL", "CAR"],
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user, ctx) {
          if (ctx?.path === "/sign-up/email") {
            const termsAccepted = (ctx.body as { termsAccepted?: unknown } | undefined)
              ?.termsAccepted;

            if (termsAccepted !== true) {
              throw APIError.from("BAD_REQUEST", {
                message: "You must accept the Terms & Conditions to create an account",
                code: "TERMS_NOT_ACCEPTED",
              });
            }
          }

          const accountType = (ctx?.body as { accountType?: unknown } | undefined)?.accountType;
          const providerType = (ctx?.body as { providerType?: unknown } | undefined)?.providerType;

          if (accountType !== undefined && accountType !== "tenant" && accountType !== "landlord") {
            throw APIError.from("BAD_REQUEST", {
              message: "Invalid account type",
              code: "INVALID_ACCOUNT_TYPE",
            });
          }
          if (
            providerType !== undefined &&
            providerType !== "HOUSE" &&
            providerType !== "HOTEL" &&
            providerType !== "CAR"
          ) {
            throw APIError.from("BAD_REQUEST", {
              message: "Invalid provider type",
              code: "INVALID_PROVIDER_TYPE",
            });
          }

          const { phoneNumber, nationalId } = user as typeof user & {
            phoneNumber?: string;
            nationalId?: string;
          };
          if (!phoneNumber) return;
          const existing = await prisma.user.findUnique({
            where: { phoneNumber },
            select: { id: true },
          });
          if (existing) {
            throw new APIError("CONFLICT", {
              message: "Phone number already in exists",
            });
          }
          if (nationalId) {
            const existingId = await prisma.user.findUnique({
              where: { nationalId },
              select: { id: true },
            });
            if (existingId) {
              throw new APIError("CONFLICT", {
                message: "ID number already in exists",
              });
            }
          }

          return {
            data: {
              role: accountType === "landlord" ? "landlord" : "tenant",
              providerType: accountType === "landlord" ? (providerType ?? "HOTEL") : "HOTEL",
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
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
});
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
