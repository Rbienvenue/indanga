"use client";

import Link from "next/link";

export function PolicyAcceptance({
  id,
  isPurchase = false,
  checked,
  onCheckedChange,
}: {
  id: string;
  isPurchase?: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="mt-4 flex cursor-pointer items-start gap-2 text-sm leading-5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 size-4 shrink-0 accent-primary"
      />
      <span>
        I have read and accept the{" "}
        <Link
          href="/refund-cancellation-policy"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary underline underline-offset-2"
        >
          Refund &amp; Cancellation Policy
        </Link>{" "}
        before {isPurchase ? "buying" : "booking"} this property.
      </span>
    </label>
  );
}
