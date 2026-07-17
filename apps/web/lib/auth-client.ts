import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  basePath: "/v1/auth",
  plugins: [
    inferAdditionalFields({
      user: {
        phoneNumber: {
          type: "string",
          required: true,
          input: true,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
