"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { RoomType } from "@indanga/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";
import { roomTypeSchema, type RoomTypeValues } from "@/lib/validations/house";

const roomSchema = roomTypeSchema.omit({ id: true }).extend({
  price: z.coerce.number<number>().int("Enter a whole RWF amount").positive("Enter a valid price"),
});
type RoomValues = z.infer<typeof roomSchema>;

export function RoomDialog({
  houseId,
  rooms,
  room,
}: {
  houseId: string;
  rooms: RoomType[];
  room?: RoomType;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", price: 0, totalRooms: 1 },
  });
  const mutation = useMutation({
    mutationFn: (values: RoomValues) => {
      // The property API replaces the room list, so preserve every other room and its ID.
      const updatedRooms: RoomTypeValues[] = rooms.map(({ id, name, price, totalRooms }) =>
        id === room?.id ? { id, ...values } : { id, name, price, totalRooms },
      );
      if (!room) updatedRooms.push(values);
      return fetcher(`/properties/${houseId}`, {
        method: "PATCH",
        body: JSON.stringify({ rooms: updatedRooms }),
      });
    },
    onSuccess: async () => {
      toast.success(room ? "Room updated successfully" : "Room added successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["properties"] }),
        queryClient.invalidateQueries({ queryKey: ["room-availability", houseId] }),
        queryClient.invalidateQueries({ queryKey: ["agent-stats"] }),
      ]);
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (mutation.isPending) return;
        if (nextOpen) {
          form.reset({
            name: room?.name ?? "",
            price: room?.price ?? 0,
            totalRooms: room?.totalRooms ?? 1,
          });
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={room ? "outline" : "default"} size={room ? "sm" : "default"}>
          {room ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {room ? "Edit" : "Add room"}
          {room ? <span className="sr-only"> {room.name}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? "Edit room" : "Add room"}</DialogTitle>
          <DialogDescription>
            Set the room category, nightly price, and total inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
            <fieldset disabled={mutation.isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Standard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per night (RWF)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalRooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total rooms</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Available rooms are calculated from bookings.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {mutation.isPending ? "Saving…" : room ? "Save changes" : "Add room"}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
