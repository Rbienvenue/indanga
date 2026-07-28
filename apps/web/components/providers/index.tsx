"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import type { Session } from "@/lib/auth-client";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute={"class"} defaultTheme="system" disableTransitionOnChange>
        <Suspense>
          <NuqsAdapter>
            <SessionProvider session={session}>{children}</SessionProvider>
          </NuqsAdapter>
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
