import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers";
import { getSession } from "@/lib/auth-client";
import { Toaster } from "sonner";

import { DM_Sans } from "next/font/google";

const font = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});



export const metadata: Metadata = {
  title: "INDANGA One Platform. Endless Possibilities.",
  description:
    "Find your next home, book the perfect hotel, or rent a car — all in one place. INDANGA simplifies your journey.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = await getSession({
    fetchOptions: { headers: await headers() },
  });

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        font.className,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers session={session ?? null}>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
