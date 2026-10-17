"use client";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import Link from "next/link";
import { Home, WalletCards, BadgeCheck, RotateCcw, LockKeyhole, ChevronRight } from "lucide-react";
import type { House } from "@/@types";
import { formatCurrency } from "@/lib/utils";
export function ListingInformation({
  house,
  bookingKind,
  isAvailable,
}: {
  house: House;
  bookingKind: "home" | "hotel" | "car";
  isAvailable: boolean;
}) {
  const t = useTranslations("properties");
  const locale = useLocale();
  const format = useFormatter();

  return (
    <section className="divide-y divide-slate-900/10 border-b border-slate-900/10 dark:divide-white/10 dark:border-white/10">
      <AccordionRow icon={Home} title={t("aboutListing")}>
        <p>{house.description}</p>
        {bookingKind !== "car" && (
          <p className="mt-3">
            {t("listingLocation", {
              location: house.location,
              bedrooms: house.bedrooms,
              bathrooms: house.bathrooms,
            })}
          </p>
        )}
      </AccordionRow>
      <AccordionRow icon={WalletCards} title={t("priceDetails")}>
        <p>
          {house.price
            ? t("listingPrice", {
                price: formatCurrency(house.price, house.currency ?? "RWF", locale),
                unit: t(`unit.${bookingKind}`),
              })
            : ""}{" "}
          {t("listingRate")}
        </p>
        <p className="mt-3">{t("platformPayment")}</p>
      </AccordionRow>
      {house.status !== "PENDING" && (
        <AccordionRow icon={BadgeCheck} title={t("verificationInformation")}>
          <p>
            {t(
              house.verificationStatus === "VerifiedByIndanga"
                ? "verifiedDescription"
                : "reviewedDescription",
            )}
          </p>
          <p className="mt-3 text-muted-foreground">
            {t(house.verificationStatus === "VerifiedByIndanga" ? "verifiedOn" : "reviewedOn", {
              date: format.dateTime(new Date(house.updatedAt), {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}{" "}
            {t("verificationDisclaimer")}
          </p>
          <p className="mt-3">{t(isAvailable ? "availableToBook" : "unavailableToBook")}</p>
        </AccordionRow>
      )}
      <AccordionRow icon={RotateCcw} title={t("cancellationRefunds")}>
        <p>{t("cancellationTerms")}</p>
        <p className="mt-3">{t("cancellationSupport")}</p>
      </AccordionRow>
      <AccordionRow icon={LockKeyhole} title={t("staySafe")}>
        <p>{t("safetyDescription")}</p>
        <p className="mt-3">
          {t.rich("reportActivity", {
            email: (chunks) => (
              <Link href="mailto:support@indanga.com" className="text-primary underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </AccordionRow>
    </section>
  );
}

function AccordionRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Home;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center gap-4 text-sm font-bold [&::-webkit-details-marker]:hidden">
        <Icon className="size-5 shrink-0 text-slate-700 dark:text-slate-300" />
        <span className="flex-1">{title}</span>
        <ChevronRight className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-90" />
      </summary>
      <div className="ml-9 max-w-3xl pt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {children}
      </div>
    </details>
  );
}
