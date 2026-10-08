import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

import { API_BASE_URL } from "./api-url";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/v1/auth",
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
    }),
    adminClient(),
    emailOTPClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
