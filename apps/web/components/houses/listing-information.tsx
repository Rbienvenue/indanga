import type { House } from "@/@types";
import type { ReactNode } from "react";
import Link from "next/link";
import { Home, WalletCards, BadgeCheck, RotateCcw, LockKeyhole, ChevronRight } from "lucide-react";
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
  const isSale = house.listingPurpose === "SELL";
  const priceUnit = bookingKind === "hotel" ? "night" : bookingKind === "car" ? "day" : "month";

  return (
    <section className="divide-y divide-slate-900/10 border-b border-slate-900/10 dark:divide-white/10 dark:border-white/10">
      <AccordionRow icon={Home} title="About this listing">
        <p>{house.description}</p>
        {bookingKind !== "car" && (
          <p className="mt-3">
            Located in {house.location}, this {house.propertyType.toLowerCase()} has{" "}
            {house.bedrooms} {house.bedrooms === 1 ? "bedroom" : "bedrooms"} and {house.bathrooms}{" "}
            {house.bathrooms === 1 ? "bathroom" : "bathrooms"}.
          </p>
        )}
      </AccordionRow>
      <AccordionRow icon={WalletCards} title="Price details">
        <p>
          {house.price
            ? `${formatCurrency(house.price, house.currency ?? "RWF")}${isSale ? "" : ` per ${priceUnit}`}.`
            : ""}{" "}
          {isSale
            ? "The displayed amount is the full asking price. Send a purchase request; payment is available after the provider accepts."
            : "The displayed price is the listing rate; confirm the total at booking."}
        </p>
        {!isSale && (
          <p className="mt-3">
            INDANGA keeps payment inside the platform so your booking record stays connected to your
            account.
          </p>
        )}
      </AccordionRow>
      {house.status !== "PENDING" && (
        <AccordionRow icon={BadgeCheck} title="Verification and listing information">
          <p>
            {house.verificationStatus === "VerifiedByIndanga"
              ? "Verified by INDANGA. INDANGA checked the provider&apos;s identity and reviewed key listing information, including the location, photos, pricing, and availability."
              : "Reviewed by INDANGA. We checked the information submitted by the provider before publishing this listing. Prices and availability can change, so review the latest details before proceeding."}
          </p>
          <p className="mt-3 text-muted-foreground">
            {house.verificationStatus === "VerifiedByIndanga" ? "Verified" : "Reviewed"} on{" "}
            {new Date(house.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . Verification does not guarantee future availability, unchanged pricing, or the quality
            of every service. Review the listing and applicable terms before making a payment.
          </p>
          <p className="mt-3">
            Availability:{" "}
            {isAvailable
              ? isSale
                ? "available for sale"
                : "available to book now"
              : "currently unavailable"}
            .
          </p>
        </AccordionRow>
      )}
      {!isSale && (
        <AccordionRow icon={RotateCcw} title="Cancellation and refunds">
          <p>
            Cancellation and refund eligibility depends on the booking status and the
            provider&apos;s terms.
          </p>
          <p className="mt-3">
            Contact INDANGA support before cancelling if you need help reviewing your booking.
          </p>
        </AccordionRow>
      )}
      <AccordionRow icon={LockKeyhole} title="Stay safe">
        <p>
          {isSale
            ? "Confirm the listing, seller, asking price, and sale terms with INDANGA before making any payment. Keep your messages and receipts."
            : "Keep all booking details, payment instructions, and receipts. Confirm the listing, provider, price, and cancellation terms before paying. INDANGA will never ask you to hide a payment or bypass the official booking process."}
        </p>
        <p className="mt-3">
          Report suspicious activity to &nbsp;
          <Link href="mailto:support@indanga.com" className="text-primary underline">
            support@indanga.com
          </Link>
          .
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
