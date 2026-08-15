"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

type BookingWithDetails = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  house: { id: string; name: string; location: string; price: number };
  client: { id: string; name: string; email: string };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function BookingActions({ booking }: { booking: BookingWithDetails }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: string) =>
      fetcher(`/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Booking status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update booking");
    },
  });

  if (booking.status !== "PENDING") return null;

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("APPROVED")}
      >
        {mutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate("REJECTED")}
      >
        {mutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <X className="size-3.5" />
        )}
        Reject
      </Button>
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
      </div>
    ),
  },
  {
    id: "property",
    header: "Property",
    accessorFn: (row) => row.house.name,
    cell: ({ row }) => (
      <div>
        <p>{row.original.house.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.house.location}</p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
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
    enableSorting: false,
    cell: ({ row }) => <BookingActions booking={row.original} />,
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
