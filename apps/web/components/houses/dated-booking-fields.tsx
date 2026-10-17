"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { addDays, format, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BookingValues } from "@/lib/validations/booking";
import { cn } from "@/lib/utils";

export function DatedBookingFields({
  form,
  submitting,
  isCar,
}: {
  form: UseFormReturn<BookingValues>;
  submitting: boolean;
  isCar: boolean;
}) {
  const checkIn = useWatch({ control: form.control, name: "checkIn" });
  const checkOut = useWatch({ control: form.control, name: "checkOut" });
  const today = startOfDay(new Date());
  const checkInDate = checkIn ? new Date(`${checkIn}T00:00:00`) : undefined;
  const checkOutDate = checkOut ? new Date(`${checkOut}T00:00:00`) : undefined;
  const checkOutMinDate = checkInDate ? addDays(checkInDate, 1) : addDays(today, 1);
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name="checkIn"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Label className="text-sm font-semibold">{isCar ? "Pick date" : "Check-in"}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    className={cn(
                      "mt-2 h-11 justify-start px-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {checkInDate ? format(checkInDate, "LLL dd, y") : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  disabled={{ before: today }}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                    const nextCheckOut = form.getValues("checkOut");
                    if (
                      date &&
                      nextCheckOut &&
                      new Date(`${nextCheckOut}T00:00:00`) <= startOfDay(date)
                    ) {
                      form.setValue("checkOut", "", { shouldValidate: true });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="checkOut"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Label className="text-sm font-semibold">{isCar ? "Return date" : "Check-out"}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    className={cn(
                      "mt-2 h-11 justify-start px-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {checkOutDate ? format(checkOutDate, "LLL dd, y") : <span>Pick a date</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  disabled={{ before: checkOutMinDate }}
                  onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
