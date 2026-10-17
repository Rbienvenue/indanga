import { useLocale, useTranslations } from "next-intl";
import type { BookingKind } from "@/lib/booking-kind";
import { DEFAULT_SERVICE_FEE, type ServiceFee } from "@/lib/service-fee";
import { formatCurrency } from "@/lib/utils";

interface BookingPriceSummaryProps {
  bookingKind: BookingKind;
  currency?: string | null;
  unitPrice: number;
  months?: number | null;
  nights: number;
  quantity: number;
  subtotal: number;
  serviceFee: number;
  serviceFeeCurrency?: string | null;
  cautionFee?: number | null;
  serviceFeeConfig?: ServiceFee | null;
  total: number;
  ready: boolean;
}

export function BookingPriceSummary({
  bookingKind,
  currency,
  unitPrice,
  months,
  nights,
  quantity,
  subtotal,
  serviceFee,
  serviceFeeCurrency,
  cautionFee,
  serviceFeeConfig,
  total,
  ready,
}: BookingPriceSummaryProps) {
  const t = useTranslations("bookings");
  const locale = useLocale();
  const config = serviceFeeConfig ?? DEFAULT_SERVICE_FEE;
  const feeLabel = !config.isActive
    ? t("serviceFeeFree")
    : config.feeType === "fixed"
      ? t("serviceFee")
      : t("serviceFeePercent", { amount: config.amount });
  const feeCurrency =
    serviceFeeCurrency ?? (serviceFeeConfig?.feeType === "fixed" ? "RWF" : (currency ?? "RWF"));
  const separateFee = feeCurrency !== (currency ?? "RWF") && serviceFee > 0;
  const isHotel = bookingKind === "hotel";
  const isCar = bookingKind === "car";
  const displayCurrency = currency ?? "RWF";
  const priceLabel = isHotel ? t("roomPrice") : isCar ? t("carPrice") : t("propertyPrice");
  const unit = t(`unit${bookingKind}`);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold">{t("priceSummary")}</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{priceLabel}</dt>
          <dd className="text-right font-medium">
            {formatCurrency(unitPrice, displayCurrency, locale)} / {unit}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t(`duration${bookingKind}`)}</dt>
          <dd>
            {bookingKind === "home" ? (ready ? (months ?? 1) : "—") : nights > 0 ? nights : "—"}
          </dd>
        </div>
        {isHotel ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("roomCount")}</dt>
            <dd>{quantity}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{t("subtotal")}</dt>
          <dd className="font-medium">
            {ready ? formatCurrency(subtotal, displayCurrency, locale) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{feeLabel}</dt>
          <dd className="font-medium">
            {ready ? formatCurrency(serviceFee, feeCurrency, locale) : "—"}
          </dd>
        </div>
        {!isHotel && cautionFee != null && cautionFee > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("cautionFee")}</dt>
            <dd className="font-medium">{formatCurrency(cautionFee, displayCurrency, locale)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t pt-3 text-base font-bold">
          <dt>{t("total")}</dt>
          <dd className="text-right">
            {ready ? formatCurrency(total, displayCurrency, locale) : "—"}
            {ready && separateFee ? ` + ${formatCurrency(serviceFee, feeCurrency, locale)}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
