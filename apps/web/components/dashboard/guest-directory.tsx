"use client";

import { useState } from "react";
import type { BookingStatus } from "@indanga/db";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/fetcher";

type GuestBooking = {
  id: string;
  bookingId: string | null;
  status: BookingStatus;
  createdAt: string;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  roomCount: number | null;
  house: { id: string; name: string };
  roomType: { name: string } | null;
};

type Guest = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  image: string | null;
  bookingCount: number;
  latestBooking: GuestBooking | null;
};

function StayDetails({ booking }: { booking: GuestBooking }) {
  return (
    <div className="space-y-1">
      <p className="text-sm">
        {booking.checkIn && booking.checkOut
          ? `${new Date(booking.checkIn).toLocaleDateString()} → ${new Date(booking.checkOut).toLocaleDateString()}`
          : "No stay dates"}
      </p>
      {booking.nights ? (
        <p className="text-xs text-muted-foreground">
          {booking.nights} night{booking.nights === 1 ? "" : "s"}
        </p>
      ) : null}
      {booking.roomType ? (
        <p className="text-xs text-muted-foreground">
          {booking.roomType.name} · {booking.roomCount ?? 1} room
          {booking.roomCount === 1 || booking.roomCount === null ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

const historyColumns: ColumnDef<GuestBooking>[] = [
  {
    accessorKey: "bookingId",
    header: "Booking",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.house.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.bookingId ?? row.original.id}</p>
      </div>
    ),
  },
  {
    id: "stay",
    header: "Stay details",
    cell: ({ row }) => <StayDetails booking={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.status.replaceAll("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Booked on",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

function GuestHistory({ guest, ownerId }: { guest: Guest; ownerId: string }) {
  const [page, setPage] = useState(1);
  const historyQuery = useQuery<PaginationResponse<GuestBooking>>({
    queryKey: ["guest-bookings", ownerId, guest.id, page],
    queryFn: () => fetcher(`/guests/${guest.id}/bookings?page=${page}&limit=10`),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{guest.name}</DialogTitle>
        <DialogDescription>Booking history across your properties</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-muted/50 p-3 text-sm">
        <a href={`mailto:${guest.email}`} className="break-all hover:underline">
          {guest.email}
        </a>
        {guest.phoneNumber ? (
          <a href={`tel:${guest.phoneNumber}`} className="hover:underline">
            {guest.phoneNumber}
          </a>
        ) : null}
      </div>
      {historyQuery.isError ? (
        <div role="alert" className="rounded-lg border p-4">
          <p className="text-sm text-destructive">Could not load booking history.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void historyQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={historyColumns}
          data={historyQuery.data?.data ?? []}
          loading={historyQuery.isLoading}
          emptyState="No bookings found for this guest."
          pagination={{
            page,
            totalPages: historyQuery.data?.meta.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      )}
    </>
  );
}

export function GuestDirectory() {
  const session = useSession();
  const ownerId = session?.user.id;
  const [search, setSearch] = useState("");
  const [houseId, setHouseId] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const guestsQuery = useQuery<PaginationResponse<Guest>>({
    queryKey: ["provider-guests", ownerId, search, houseId, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (houseId !== "all") params.set("houseId", houseId);
      return fetcher(`/guests?${params}`);
    },
    enabled: session?.user.role === "landlord",
  });
  const propertiesQuery = useQuery<ApiResponse<{ id: string; name: string }[]>>({
    queryKey: ["guest-properties", ownerId],
    queryFn: () => fetcher("/guests/properties"),
    enabled: session?.user.role === "landlord",
  });

  const columns: ColumnDef<Guest>[] = [
    {
      accessorKey: "name",
      header: "Guest",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            {row.original.image ? (
              <AvatarImage src={row.original.image} alt={row.original.name} />
            ) : null}
            <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => row.original.phoneNumber ?? "—",
    },
    { accessorKey: "bookingCount", header: "Bookings" },
    {
      id: "latestBooking",
      header: "Latest booking",
      cell: ({ row }) => {
        const booking = row.original.latestBooking;
        return booking ? (
          <div className="space-y-2">
            <p className="font-medium">{booking.house.name}</p>
            <StayDetails booking={booking} />
            <Badge variant="secondary">{booking.status.replaceAll("_", " ")}</Badge>
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      id: "history",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedGuest(row.original)}
          aria-label={`View booking history for ${row.original.name}`}
        >
          View history
        </Button>
      ),
    },
  ];

  return (
    <main>
      <PageHeader title="Guests" description="People who have booked your properties" />
      <p className="mb-4 text-sm text-muted-foreground">
        {guestsQuery.data?.meta.total ?? 0} guests
        {houseId !== "all" ? " at this property" : " across your properties"}
      </p>
      {propertiesQuery.isError ? (
        <p role="alert" className="mb-4 text-sm text-destructive">
          Could not load property filters.{" "}
          <button className="underline" onClick={() => void propertiesQuery.refetch()}>
            Try again
          </button>
        </p>
      ) : null}
      {guestsQuery.isError ? (
        <div role="alert" className="rounded-xl border bg-card p-6">
          <p className="text-sm text-destructive">Could not load guests.</p>
          <Button variant="outline" className="mt-3" onClick={() => void guestsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={guestsQuery.data?.data ?? []}
          loading={guestsQuery.isLoading}
          search={{
            placeholder: "Search by name or email",
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
          }}
          filterBy={[
            {
              id: "property",
              placeholder: "All properties",
              value: houseId,
              options: (propertiesQuery.data?.data ?? []).map((property) => ({
                label: property.name,
                value: property.id,
              })),
              onChange: (value) => {
                setHouseId(value);
                setPage(1);
              },
            },
          ]}
          emptyState={
            <div className="flex flex-col items-center gap-2">
              <Users className="size-8 text-muted-foreground" />
              <p className="font-medium">
                {search || houseId !== "all" ? "No matching guests" : "No guests yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search || houseId !== "all"
                  ? "Try another search or property."
                  : "Guests will appear here when they book your properties."}
              </p>
            </div>
          }
          pagination={{
            page,
            totalPages: guestsQuery.data?.meta.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      )}
      <Dialog
        open={selectedGuest !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedGuest(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          {selectedGuest && ownerId ? (
            <GuestHistory key={selectedGuest.id} guest={selectedGuest} ownerId={ownerId} />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
