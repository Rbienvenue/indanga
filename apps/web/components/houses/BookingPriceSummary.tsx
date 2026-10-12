import type { BookingKind } from "@/lib/booking-kind";
import { getServiceFeeLabel, type ServiceFee } from "@/lib/service-fee";
import { formatPrice } from "@/lib/utils";

interface BookingPriceSummaryProps {
  bookingKind: BookingKind;
  currency?: string | null;
  unitPrice: number;
  nights: number;
  quantity: number;
  subtotal: number;
  serviceFee: number;
  cautionFee?: number | null;
  serviceFeeConfig?: ServiceFee | null;
  total: number;
  ready: boolean;
}

export function BookingPriceSummary({
  bookingKind,
  currency,
  unitPrice,
  nights,
  quantity,
  subtotal,
  serviceFee,
  cautionFee,
  serviceFeeConfig,
  total,
  ready,
}: BookingPriceSummaryProps) {
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
            {formatPrice(unitPrice, displayCurrency)} / {unit}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            Number of {isHotel ? "nights" : isCar ? "days" : "months"}
          </dt>
          <dd>{bookingKind === "home" ? 1 : nights > 0 ? nights : "—"}</dd>
        </div>
        {isHotel ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Number of rooms</dt>
            <dd>{quantity}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{ready ? formatPrice(subtotal, displayCurrency) : "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{getServiceFeeLabel(serviceFeeConfig)}</dt>
          <dd className="font-medium">{ready ? formatPrice(serviceFee, displayCurrency) : "—"}</dd>
        </div>
        {!isHotel && cautionFee != null && cautionFee > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Caution fee (fixed)</dt>
            <dd className="font-medium">{formatPrice(cautionFee, displayCurrency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 border-t pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{ready ? formatPrice(total, displayCurrency) : "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
