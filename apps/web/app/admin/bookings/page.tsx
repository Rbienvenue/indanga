"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
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
