"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BookingValues } from "@/lib/validations/booking";

export function HomeBookingFields({
  form,
  submitting,
}: {
  form: UseFormReturn<BookingValues>;
  submitting: boolean;
}) {
  const t = useTranslations("bookings");
  return (
    <FormField
      control={form.control}
      name="months"
      render={({ field }) => (
        <FormItem className="w-1/2 min-w-0">
          <FormLabel className="text-sm font-semibold">{t("monthsLabel")}</FormLabel>
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              disabled={submitting || (field.value ?? 1) <= 1}
              onClick={() => field.onChange(Math.max((field.value ?? 1) - 1, 1))}
              aria-label={t("fewerMonths")}
            >
              <Minus className="size-4" />
            </Button>
            <FormControl>
              <Input
                type="number"
                min={1}
                step={1}
                className="h-11 min-w-0 flex-1 px-1 text-center"
                disabled={submitting}
                {...field}
                value={field.value ?? 1}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              disabled={submitting}
              onClick={() => field.onChange((field.value ?? 1) + 1)}
              aria-label={t("moreMonths")}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
