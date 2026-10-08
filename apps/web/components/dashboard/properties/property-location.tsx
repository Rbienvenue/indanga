"use client";
import { useFormContext } from "react-hook-form";
import { LocationSelector } from "@/components/location-selector";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CreateHouseValues } from "@/lib/validations/house";

export function PropertyLocation() {
  const form = useFormContext<CreateHouseValues>();
  return (
    <div className="space-y-6">
      {" "}
      <LocationSelector
        styles="w-full"
        province={form.watch("province") ?? ""}
        district={form.watch("district")}
        sector={form.watch("sector")}
        cell={form.watch("cell")}
        village={form.watch("village")}
        onProvinceChange={(v) => form.setValue("province", v, { shouldValidate: true })}
        onDistrictChange={(v) => form.setValue("district", v, { shouldValidate: true })}
        onSectorChange={(v) => form.setValue("sector", v, { shouldValidate: true })}
        onCellChange={(v) => form.setValue("cell", v, { shouldValidate: true })}
        onVillageChange={(v) => form.setValue("village", v, { shouldValidate: true })}
        errors={{
          province: form.formState.errors.province?.message,
          district: form.formState.errors.district?.message,
          sector: form.formState.errors.sector?.message,
          cell: form.formState.errors.cell?.message,
          village: form.formState.errors.village?.message,
        }}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street address</FormLabel>
            <FormControl>
              <Input placeholder="Optional" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
