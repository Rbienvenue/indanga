"use client";

import type { RoomType } from "@indanga/db";
import type { UseFormReturn } from "react-hook-form";
import { BedDouble, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingValues } from "@/lib/validations/booking";
import { formatPrice } from "@/lib/utils";

type RoomAvailability = {
  roomType: RoomType;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
};

export function HotelBookingFields({
  form,
  rooms,
  submitting,
  currency,
  checkIn,
  checkOut,
  nights,
  roomTypeId,
  quantity,
  availabilityByRoom,
}: {
  form: UseFormReturn<BookingValues>;
  rooms: RoomType[];
  submitting: boolean;
  currency: string;
  checkIn?: string;
  checkOut?: string;
  nights: number;
  roomTypeId?: string;
  quantity: number;
  availabilityByRoom: Map<string, RoomAvailability>;
}) {
  const selectedRoom = rooms.find((room) => room.id === roomTypeId);
  const selectedAvailability = roomTypeId ? availabilityByRoom.get(roomTypeId) : undefined;
  const maxRooms = selectedAvailability
    ? selectedAvailability.availableRooms
    : (selectedRoom?.totalRooms ?? 1);
  const maxGuests = (selectedRoom?.capacity ?? 1) * quantity;
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name="roomTypeId"
        render={({ field }) => (
          <FormItem className="flex min-w-0 flex-col">
            <Label className="text-sm font-semibold">Room type</Label>
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("roomCount", 1, { shouldValidate: true });
              }}
              disabled={submitting || rooms.length === 0}
            >
              <FormControl>
                <SelectTrigger className="mt-2 h-11 w-full">
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rooms.map((room) => {
                  const availability = availabilityByRoom.get(room.id);
                  const left =
                    checkIn && checkOut && nights > 0
                      ? (availability?.availableRooms ?? room.totalRooms)
                      : room.totalRooms;
                  return (
                    <SelectItem key={room.id} value={room.id} disabled={left <= 0}>
                      <span className="flex items-center gap-2">
                        <BedDouble className="size-4 text-muted-foreground" />
                        {room.name} · {formatPrice(room.price, currency)} / night · Sleeps{" "}
                        {room.capacity} ·{" "}
                        {left <= 0 ? "sold out" : `${left} room${left > 1 ? "s" : ""} left`}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="roomCount"
        render={({ field }) => (
          <FormItem className="min-w-0">
            <Label className="text-sm font-semibold">Number of rooms</Label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0"
                disabled={submitting || quantity <= 1}
                onClick={() => field.onChange(Math.max(quantity - 1, 1))}
                aria-label="Fewer rooms"
              >
                <Minus className="size-4" />
              </Button>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={Math.max(maxRooms, 1)}
                  className="h-11 min-w-0 flex-1 px-1 text-center"
                  disabled={submitting || !selectedRoom}
                  {...field}
                  value={field.value ?? 1}
                  onChange={(event) => {
                    const next = Math.floor(Number(event.target.value));
                    field.onChange(
                      Number.isNaN(next) ? 1 : Math.min(Math.max(next, 1), Math.max(maxRooms, 1)),
                    );
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0"
                disabled={submitting || !selectedRoom || quantity >= maxRooms}
                onClick={() => field.onChange(Math.min(quantity + 1, Math.max(maxRooms, 1)))}
                aria-label="More rooms"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {selectedRoom && checkIn && checkOut && nights > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {maxRooms > 0
                  ? `${maxRooms} ${selectedRoom.name} room${maxRooms > 1 ? "s" : ""} available for these dates`
                  : `No ${selectedRoom.name} rooms left for these dates`}
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="guestCount"
        render={({ field }) => (
          <FormItem className="col-start-1 min-w-0">
            <FormLabel className="text-sm font-semibold">Number of guests</FormLabel>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0"
                disabled={submitting || (field.value ?? 1) <= 1}
                onClick={() => field.onChange(Math.max((field.value ?? 1) - 1, 1))}
                aria-label="Fewer guests"
              >
                <Minus className="size-4" />
              </Button>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={maxGuests}
                  step={1}
                  className="h-11 min-w-0 flex-1 px-1 text-center"
                  disabled={submitting || !selectedRoom}
                  {...field}
                  value={field.value ?? 1}
                  onChange={(event) => {
                    const next = Math.floor(Number(event.target.value));
                    field.onChange(Number.isNaN(next) ? 1 : Math.min(Math.max(next, 1), maxGuests));
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0"
                disabled={submitting || !selectedRoom || (field.value ?? 1) >= maxGuests}
                onClick={() => field.onChange(Math.min((field.value ?? 1) + 1, maxGuests))}
                aria-label="More guests"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {selectedRoom ? (
              <p className="text-xs text-muted-foreground">
                Up to {selectedRoom.capacity * quantity} guests across the selected rooms
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
