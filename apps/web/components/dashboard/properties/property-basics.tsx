"use client";
import { useFormContext } from "react-hook-form";
import { Car, Home, Hotel } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  propertyTypes,
  subTypesByPropertyType,
  typeHasRooms,
  type CreateHouseValues,
  type PropertyType,
} from "@/lib/validations/house";
const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  House: <Home className="size-5" />,
  Hotel: <Hotel className="size-5" />,
  Car: <Car className="size-5" />,
};
export function PropertyBasics({ allowTypeSelection }: { allowTypeSelection: boolean }) {
  const form = useFormContext<CreateHouseValues>();
  const selectedType = form.watch("propertyType");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{selectedType === "Car" ? "Vehicle name" : "Property name"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    selectedType === "Hotel"
                      ? "e.g. Kigali Garden Hotel"
                      : selectedType === "Car"
                        ? "e.g. Toyota RAV4"
                        : "e.g. Serene 3-bedroom villa"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {allowTypeSelection && (
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("subType", undefined);
                      if (value !== "Hotel") {
                        form.setValue("rooms", []);
                      }
                      if (!typeHasRooms(value as PropertyType)) {
                        form.setValue("bedrooms", undefined);
                        form.setValue("bathrooms", undefined);
                        form.setValue("metadata", []);
                      }
                    }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                  >
                    {propertyTypes.map((type) => (
                      <Label
                        key={type}
                        htmlFor={`type-${type}`}
                        className="border-input has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
                      >
                        {propertyTypeIcons[type]}
                        <RadioGroupItem value={type} id={`type-${type}`} className="sr-only" />
                        <span className="text-sm font-medium">{type}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="subType"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {subTypesByPropertyType[selectedType].map((subType) => (
                      <SelectItem key={subType} value={subType}>
                        {subType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your property..." className="min-h-20" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
