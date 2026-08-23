import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  ...(typeof window === "undefined" && {
    baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "https://indanga-api-tau.vercel.app"}/v1/auth`,
  }),
  basePath: "/api/auth",
  plugins: [
    inferAdditionalFields({
      user: {
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
        accountType: {
          type: ["tenant", "landlord"],
          required: true,
          input: true,
          returned: false,
        },
      },
    }),
    adminClient(),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
