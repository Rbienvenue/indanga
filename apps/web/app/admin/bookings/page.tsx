"use client";

import { useState } from "react";
import type { BookingStatus } from "@indanga/db";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingRequestActions } from "@/components/bookings/booking-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetcher } from "@/lib/fetcher";
import { getBookingKind } from "@/lib/booking-kind";
import { formatPrice } from "@/lib/utils";

type BookingWithDetails = {
  id: string;
  bookingId?: string | null;
  status: BookingStatus;
  createdAt: string;
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number | null;
  totalAmount?: number | null;
  responseDeadline: string | null;
  paymentDeadline: string | null;
  declineReason: string | null;
  roomCount: number | null;
  roomType: { id: string; name: string } | null;
  house: {
    id: string;
    name: string;
    location: string;
    price: number;
    propertyType: string;
    owner: { id: string; name: string; email: string };
  };
  client: { id: string; name: string; email: string };
};

const statusColors: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
  COMPLETED: "bg-sky-100 text-sky-700",
  REQUESTED: "bg-amber-100 text-amber-700",
  AWAITING_PAYMENT: "bg-violet-100 text-violet-700",
  CONFIRMED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
};

function AdminBookingActions({ booking }: { booking: BookingWithDetails }) {
  const isCar = getBookingKind(booking.house.propertyType) === "car";

  return (
    <div className="flex flex-col items-start gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            View details
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Booking details</SheetTitle>
            <SheetDescription>{booking.bookingId ?? booking.id}</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 px-6 pb-6">
            <div>
              <Link
                href={`/properties/${booking.house.id}`}
                className="font-semibold hover:underline"
              >
                {booking.house.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{booking.house.location}</p>
              <p className="mt-1 text-sm text-muted-foreground">{booking.house.propertyType}</p>
              {booking.roomType ? (
                <p className="mt-2 text-sm">
                  {booking.roomType.name} · {booking.roomCount ?? 1} room(s)
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="min-w-0">
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="mt-1 font-medium">{booking.client.name}</dd>
                <dd className="break-all text-muted-foreground">{booking.client.email}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="mt-1 font-medium">{booking.house.owner.name}</dd>
                <dd className="break-all text-muted-foreground">{booking.house.owner.email}</dd>
              </div>
              {booking.checkIn ? (
                <div>
                  <dt className="text-muted-foreground">{isCar ? "Pickup" : "Check-in"}</dt>
                  <dd className="mt-1 font-medium">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </dd>
                </div>
              ) : null}
              {booking.checkOut ? (
                <div>
                  <dt className="text-muted-foreground">{isCar ? "Return" : "Check-out"}</dt>
                  <dd className="mt-1 font-medium">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </dd>
                </div>
              ) : null}
              {booking.nights ? (
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="mt-1 font-medium">
                    {booking.nights} {isCar ? "day" : "night"}
                    {booking.nights > 1 ? "s" : ""}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="mt-1 font-medium">
                  {booking.totalAmount != null ? formatPrice(booking.totalAmount) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Requested on</dt>
                <dd className="mt-1 font-medium">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
            <Badge variant="secondary" className={statusColors[booking.status]}>
              {booking.status.replaceAll("_", " ")}
            </Badge>
            {booking.status === "REQUESTED" && booking.responseDeadline ? (
              <p className="text-sm">
                Respond by{" "}
                {new Date(booking.responseDeadline).toLocaleString("en-RW", {
                  timeZone: "Africa/Kigali",
                })}{" "}
                (Kigali).
              </p>
            ) : null}
            {booking.status === "AWAITING_PAYMENT" && booking.paymentDeadline ? (
              <p className="text-sm">
                Payment due by{" "}
                {new Date(booking.paymentDeadline).toLocaleString("en-RW", {
                  timeZone: "Africa/Kigali",
                })}{" "}
                (Kigali).
              </p>
            ) : null}
            {booking.declineReason ? (
              <p className="break-words text-sm">Decline reason: {booking.declineReason}</p>
            ) : null}
            {booking.status === "REQUESTED" ? (
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Respond on behalf of the provider. Accepting moves this booking to awaiting
                  payment.
                </p>
                <BookingRequestActions
                  bookingId={booking.id}
                  responseDeadline={booking.responseDeadline}
                />
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      {booking.status === "REQUESTED" ? (
        <BookingRequestActions bookingId={booking.id} responseDeadline={booking.responseDeadline} />
      ) : null}
    </div>
  );
}

const columns: ColumnDef<BookingWithDetails>[] = [
  {
    id: "client",
    header: "Client",
    accessorFn: (row) => row.client.name,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.client.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.client.email}</p>
        {row.original.bookingId ? (
          <p className="text-xs font-medium text-muted-foreground">{row.original.bookingId}</p>
        ) : null}
      </div>
    ),
  },
  {
    id: "property",
    header: "Property",
    size: 220,
    accessorFn: (row) => row.house.name,
    cell: ({ row }) => (
      <p className="max-w-48 whitespace-normal break-words">{row.original.house.name}</p>
    ),
  },
  {
    id: "total",
    header: "Total",
    accessorFn: (row) => row.totalAmount,
    cell: ({ row }) =>
      row.original.totalAmount != null ? (
        <span className="font-medium">{formatPrice(row.original.totalAmount)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusColors[row.original.status]}>
        {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <AdminBookingActions booking={row.original} />,
  },
];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = useQuery<PaginationResponse<BookingWithDetails>>({
    queryKey: ["admin-bookings", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/admin/bookings?${params}`);
    },
  });

  const bookings = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Bookings" description={`${meta?.total ?? 0} total bookings`} />

      {query.isError ? (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Unable to load bookings.</p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={bookings}
        loading={query.isLoading}
        filterBy={[
          {
            id: "status",
            placeholder: "All Status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1);
            },
            options: [
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Requested", value: "REQUESTED" },
              { label: "Awaiting payment", value: "AWAITING_PAYMENT" },
              { label: "Confirmed", value: "CONFIRMED" },
              { label: "Declined", value: "DECLINED" },
              { label: "Expired", value: "EXPIRED" },
            ],
          },
        ]}
        pagination={{
          page,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
