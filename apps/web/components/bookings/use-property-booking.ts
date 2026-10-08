"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/@types";
import type { BookingPropertyCardBooking } from "./booking-property-card";
import { useSession } from "@/components/providers/session-provider";
import { useSocketIo } from "@/components/providers/socket-io-provider";
import { fetcher } from "@/lib/fetcher";

export function usePropertyBooking(houseId: string) {
  const session = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const queryKey = ["bookings", "property", houseId, userId];
  const query = useQuery<ApiResponse<BookingPropertyCardBooking | null>>({
    queryKey,
    queryFn: () => fetcher(`/bookings/active?houseId=${encodeURIComponent(houseId)}`),
    enabled: Boolean(userId),
  });
  const { socket, isConnected } = useSocketIo(Boolean(userId));

  useEffect(() => {
    if (!socket || !isConnected || !userId) return;
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings", "property", houseId, userId] });
    };
    const handleNotification = (notification: { bookingId?: string | null }) => {
      if (notification.bookingId) refresh();
    };
    socket.on("notification", handleNotification);
    // Refresh after the subscription is acknowledged, including on reconnect.
    socket.on("subscribed:notifications", refresh);
    socket.emit("subscribe:notifications", { userId });
    return () => {
      socket.off("notification", handleNotification);
      socket.off("subscribed:notifications", refresh);
    };
  }, [houseId, isConnected, queryClient, socket, userId]);

  return {
    ...query,
    saveBooking: (booking: BookingPropertyCardBooking) => {
      queryClient.setQueryData<ApiResponse<BookingPropertyCardBooking | null>>(queryKey, {
        data: booking,
      });
    },
  };
}
