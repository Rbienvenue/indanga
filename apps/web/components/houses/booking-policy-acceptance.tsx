"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function PolicyAcceptance({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const t = useTranslations("bookings");
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
        {t.rich("acceptPolicy", {
          policy: (chunks) => (
            <Link
              href="/refund-cancellation-policy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2"
            >
              {chunks}
            </Link>
          ),
        })}
      </span>
    </label>
  );
}
