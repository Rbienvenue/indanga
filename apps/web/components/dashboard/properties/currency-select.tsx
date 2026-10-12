"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateHouseValues } from "@/lib/validations/house";

export const currencies = ["RWF", "USD"] as const;

export function CurrencyField({ label = "Currency" }: { label?: string }) {
  const form = useFormContext<CreateHouseValues>();
  return (
    <FormField
      control={form.control}
      name="currency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? "RWF"}
              onValueChange={field.onChange}
              disabled={field.disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
