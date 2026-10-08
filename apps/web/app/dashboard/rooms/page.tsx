"use client";

import type { House, RoomType } from "@indanga/db";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { BedDouble } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { RoomDialog } from "@/components/dashboard/properties/room-dialog";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

type Hotel = House & { rooms: RoomType[] };
type Availability = {
  roomType: RoomType;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
};

export default function RoomsPage() {
  const session = useSession();
  const canManage =
    session?.user.role === "admin" ||
    (session?.user.role === "landlord" && session.user.providerType === "HOTEL");
  const ownerId = session?.user.role === "landlord" ? session.user.id : undefined;
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const hotelsQuery = useQuery({
    queryKey: ["properties", "rooms", ownerId, page],
    queryFn: () =>
      fetcher<PaginationResponse<Hotel>>(
        `/properties?propertyType=Hotel&page=${page}&limit=20${ownerId ? `&ownerId=${ownerId}` : ""}`,
      ),
    enabled: canManage,
  });
  const hotels = hotelsQuery.data?.data ?? [];
  const houseId = hotels.find((hotel) => hotel.id === selectedId)?.id ?? hotels[0]?.id;
  const hotelQuery = useQuery({
    queryKey: ["properties", houseId],
    queryFn: () => fetcher<ApiResponse<Hotel>>(`/properties/${houseId}`),
    enabled: canManage && !!houseId,
  });
  const hotel = hotelQuery.data?.data;
  const today = new Date();
  const checkIn = format(today, "yyyy-MM-dd");
  const checkOut = format(addDays(today, 1), "yyyy-MM-dd");
  const availabilityQuery = useQuery({
    queryKey: ["room-availability", houseId, checkIn, checkOut],
    queryFn: () =>
      fetcher<ApiResponse<Availability[]>>(
        `/properties/${houseId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
      ),
    enabled: canManage && !!houseId,
  });
  const meta = hotelsQuery.data?.meta;

  if (!canManage) return <p>Room inventory is available to hotel providers.</p>;

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Property inventory
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Rooms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your room details, nightly rates, and availability up to date.
          </p>
        </div>
        {hotel ? <RoomDialog key={hotel.id} houseId={hotel.id} rooms={hotel.rooms} /> : null}
      </header>
      {hotelsQuery.isLoading ? (
        <Skeleton className="h-10 w-64" />
      ) : hotelsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load hotels.{" "}
          <Button variant="link" onClick={() => void hotelsQuery.refetch()}>
            Retry
          </Button>
        </p>
      ) : hotels.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-muted-foreground">Add a hotel before managing its rooms.</p>
            <Button asChild>
              <Link href="/dashboard/properties/new?type=Hotel">Add hotel</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Select value={houseId} onValueChange={setSelectedId}>
            <SelectTrigger aria-label="Hotel" className="w-full sm:w-80">
              <SelectValue placeholder="Select a hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotels.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hotelQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : hotelQuery.isError ? (
            <p role="alert" className="text-sm text-destructive">
              Unable to load rooms.{" "}
              <Button variant="link" onClick={() => void hotelQuery.refetch()}>
                Retry
              </Button>
            </p>
          ) : hotel?.rooms.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No room categories yet. Add your first room category above.
              </CardContent>
            </Card>
          ) : (
            <>
              {availabilityQuery.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  Unable to load today's availability.{" "}
                  <Button variant="link" onClick={() => void availabilityQuery.refetch()}>
                    Retry
                  </Button>
                </p>
              ) : null}
              <section
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                aria-label="Room categories"
              >
                {hotel?.rooms.map((room) => {
                  const availability = availabilityQuery.data?.data.find(
                    (item) => item.roomType.id === room.id,
                  );
                  return (
                    <Card key={room.id}>
                      <CardHeader className="space-y-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <BedDouble className="size-6" />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">{room.name}</h2>
                            <p className="text-xs text-muted-foreground">Room category</p>
                          </div>
                          <RoomDialog houseId={hotel.id} rooms={hotel.rooms} room={room} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                          <div>
                            <dd className="font-semibold">{room.totalRooms}</dd>
                            <dt className="mt-1 text-xs text-muted-foreground">Total rooms</dt>
                          </div>
                          <div>
                            <dd className="font-semibold text-emerald-600">
                              {availability?.availableRooms ?? "—"}
                            </dd>
                            <dt className="mt-1 text-xs text-muted-foreground">
                              Available tonight
                            </dt>
                          </div>
                          <div>
                            <dd className="font-semibold">{formatPrice(room.price)}</dd>
                            <dt className="mt-1 text-xs text-muted-foreground">Per night</dt>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>
            </>
          )}
          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous hotels
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next hotels
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
