"use client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { amenityIcons } from "@/lib/amenities";
import {
  propertyAmenities,
  propertyAmenityLabels,
  type CreateHouseValues,
} from "@/lib/validations/house";

export function PropertyDetails() {
  const form = useFormContext<CreateHouseValues>();
  const type = form.watch("propertyType");
  return (
    <div className="space-y-6">
      {type === "Hotel" ? <HotelDetails /> : type === "House" ? <HouseDetails /> : <CarDetails />}
    </div>
  );
}

function PriceField({ unit }: { unit: "month" | "day" }) {
  const form = useFormContext<CreateHouseValues>();
  return (
    <FormField
      control={form.control}
      name="price"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {unit === "month" ? "Monthly rent (RWF)" : "Daily rental price (RWF)"}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 150000"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function HouseDetails() {
  const form = useFormContext<CreateHouseValues>();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <PriceField unit="month" />
      </div>
      <FormField
        control={form.control}
        name="bedrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bedrooms</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bathrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bathrooms</FormLabel>
            <FormControl>
              <Input type="number" min={0} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
function CarDetails() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Clients rent this vehicle by the day.</p>
      <PriceField unit="day" />
    </div>
  );
}
function HotelDetails() {
  const form = useFormContext<CreateHouseValues>();
  const {
    fields: roomFields,
    append: appendRoom,
    remove: removeRoom,
  } = useFieldArray({ control: form.control, name: "rooms" });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Room types</Label>
          <p className="text-muted-foreground text-sm">
            Guests book individual rooms, not the whole hotel.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendRoom({ name: "", price: 0, totalRooms: 1 })}
        >
          <Plus className="size-4" /> Add room
        </Button>
      </div>
      {roomFields.length === 0 ? (
        <p className="text-muted-foreground rounded-md bg-muted/50 px-3 py-4 text-center text-sm">
          No room types yet. Add e.g. Standard, Deluxe, Suite with price and quantity.
        </p>
      ) : null}
      {roomFields.map((roomField, index) => (
        <div
          key={roomField.id}
          className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md bg-muted/40 p-2"
        >
          <FormField
            control={form.control}
            name={`rooms.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Room name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Standard" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`rooms.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Price/night (RWF)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 45000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`rooms.${index}.totalRooms`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">No. of rooms</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove room type"
            onClick={() => removeRoom(index)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
      {form.formState.errors.rooms?.message ? (
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.rooms.message as string}
        </p>
      ) : null}
    </div>
  );
}
export function PropertyFeatures() {
  const form = useFormContext<CreateHouseValues>();
  return (
    <FormField
      control={form.control}
      name="metadata"
      render={() => (
        <FormItem>
          <FormLabel>Features</FormLabel>
          <p className="text-muted-foreground text-sm">
            Select the features available at this property (optional).
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {propertyAmenities.map((amenity) => (
              <FormField
                key={amenity}
                control={form.control}
                name="metadata"
                render={({ field }) => {
                  const selected = field.value ?? [];
                  const checked = selected.includes(amenity);
                  const AmenityIcon = amenityIcons[amenity];
                  return (
                    <FormItem>
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="border-input has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors hover:bg-accent"
                      >
                        <FormControl>
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={checked}
                            onCheckedChange={(value) => {
                              const next =
                                value === true
                                  ? [...selected, amenity]
                                  : selected.filter((item) => item !== amenity);
                              field.onChange(next);
                            }}
                          />
                        </FormControl>
                        <AmenityIcon className="size-4" />
                        <span className="text-sm font-medium">
                          {propertyAmenityLabels[amenity]}
                        </span>
                      </Label>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
