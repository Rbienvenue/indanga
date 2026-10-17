import type { BookingKind } from "@/lib/booking-kind";
import { getServiceFeeLabel, type ServiceFee } from "@/lib/service-fee";
import { formatCurrency } from "@/lib/utils";

interface BookingPriceSummaryProps {
  bookingKind: BookingKind;
  isPurchase?: boolean;
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
  isPurchase = false,
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
  const feeCurrency =
    serviceFeeCurrency ?? (serviceFeeConfig?.feeType === "fixed" ? "RWF" : (currency ?? "RWF"));
  const separateFee = feeCurrency !== (currency ?? "RWF") && serviceFee > 0;
  const isHotel = bookingKind === "hotel";
  const isCar = bookingKind === "car";
  const displayCurrency = currency ?? "RWF";
  const priceLabel = isHotel ? "Room price" : isCar ? "Car price" : "Property price";
  const unit = isHotel ? "night" : isCar ? "day" : "month";

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold">Price summary</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{priceLabel}</dt>
          <dd className="text-right font-medium">
            {formatCurrency(unitPrice, displayCurrency)}
            {!isPurchase && ` / ${unit}`}
          </dd>
        </div>
        {!isPurchase && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">
              Number of {isHotel ? "nights" : isCar ? "days" : "months"}
            </dt>
            <dd>
              {bookingKind === "home" ? (ready ? (months ?? 1) : "—") : nights > 0 ? nights : "—"}
            </dd>
          </div>
        )}
        {!isPurchase && isHotel ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Number of rooms</dt>
            <dd>{quantity}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{ready ? formatCurrency(subtotal, displayCurrency) : "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{getServiceFeeLabel(serviceFeeConfig)}</dt>
          <dd className="font-medium">{ready ? formatCurrency(serviceFee, feeCurrency) : "—"}</dd>
        </div>
        {!isPurchase && !isHotel && cautionFee != null && cautionFee > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Caution fee (fixed)</dt>
            <dd className="font-medium">{formatCurrency(cautionFee, displayCurrency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd className="text-right">
            {ready ? formatCurrency(total, displayCurrency) : "—"}
            {ready && separateFee ? ` + ${formatCurrency(serviceFee, feeCurrency)}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
