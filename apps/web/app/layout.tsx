import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers";
import { getSession } from "@/lib/auth-client";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { DM_Sans } from "next/font/google";

const font = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("title"), description: t("description") };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ data: session }, locale] = await Promise.all([
    getSession({ fetchOptions: { headers: await headers() } }),
    getLocale(),
  ]);

  return (
    <html lang={locale} className={cn("h-full", "antialiased", font.className, "font-sans")}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Providers session={session ?? null}>{children}</Providers>
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
