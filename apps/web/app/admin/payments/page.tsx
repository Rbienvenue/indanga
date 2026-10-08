"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Loader2, RefreshCw, WalletCards } from "lucide-react";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { fetcher } from "@/lib/fetcher";
import { getBookingKind } from "@/lib/booking-kind";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

type PaymentWithBooking = {
  id: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  transactionReference: string;
  createdAt: string;
  booking: {
    id: string;
    checkIn?: string | null;
    checkOut?: string | null;
    nights?: number | null;
    serviceFee: number | null;
    house: { name: string; propertyType: string };
    client: { name: string; email: string };
  };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

function RefreshPayment({ payment }: { payment: PaymentWithBooking }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      fetcher("/payments/refresh", {
        method: "POST",
        body: JSON.stringify({
          transactionReference: payment.transactionReference,
        }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-payments"] }),
      ]);
    },
  });

  if (payment.status !== "PENDING") return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      title="Refresh payment status"
      aria-label="Refresh payment status"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
    </Button>
  );
}

const columns: ColumnDef<PaymentWithBooking>[] = [
  {
    accessorKey: "amount",
    header: "Customer paid / due",
    cell: ({ row }) => <span className="font-medium">{formatPrice(row.original.amount)}</span>,
  },
  {
    id: "commission",
    header: "Commission earned",
    accessorFn: (row) => (row.status === "COMPLETED" ? (row.booking.serviceFee ?? 0) : 0),
    cell: ({ getValue }) => <span className="font-medium">{formatPrice(getValue<number>())}</span>,
  },
  {
    id: "tenant",
    header: "Client",
    accessorFn: (row) => row.booking.client.name,
    cell: ({ row }) => (
      <div>
        <p>{row.original.booking.client.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.booking.client.email}</p>
      </div>
    ),
  },
  {
    id: "property",
    header: "Property",
    accessorFn: (row) => row.booking.house.name,
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    id: "stay",
    header: "Booking period",
    cell: ({ row }) => {
      const { checkIn, checkOut, nights } = row.original.booking;
      const unit =
        getBookingKind(row.original.booking.house.propertyType) === "car" ? "day" : "night";
      if (!checkIn || !checkOut) return <span className="text-muted-foreground">—</span>;
      return (
        <div>
          <p className="text-sm">
            {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}
          </p>
          {nights ? (
            <p className="text-xs text-muted-foreground">
              {nights} {unit}
              {nights > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      );
    },
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
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={statusColors[row.original.status]}>
          {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
        </Badge>
        <RefreshPayment payment={row.original} />
      </div>
    ),
  },
];

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const statsQuery = useQuery<ApiResponse<{ totalRevenue: number; totalCollected: number }>>({
    queryKey: ["admin-stats"],
    queryFn: () => fetcher("/admin/stats"),
  });

  const query = useQuery<PaginationResponse<PaymentWithBooking>>({
    queryKey: ["admin-payments", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/admin/payments?${params}`);
    },
  });

  const payments = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Payments"
        description="Track customer payments and Indanga’s earned commission."
      />

      {statsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load payment totals.{" "}
          <button className="underline" onClick={() => void statsQuery.refetch()}>
            Retry
          </button>
        </p>
      ) : statsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Commission earned · all time"
            value={formatPrice(statsQuery.data?.data.totalRevenue ?? 0)}
            icon={<WalletCards className="size-5" />}
          />
          <StatCard
            title="Customer payments collected · all time"
            value={formatPrice(statsQuery.data?.data.totalCollected ?? 0)}
            icon={<CreditCard className="size-5" />}
          />
        </section>
      )}
      <p className="text-sm text-muted-foreground">
        Totals include completed payments only. Customer payments include the provider’s booking
        amount and Indanga’s service fee.
      </p>
      {query.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Unable to load payments.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Retry
          </button>
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
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
                { label: "Completed", value: "COMPLETED" },
                { label: "Failed", value: "FAILED" },
              ],
            },
          ]}
          pagination={{
            page,
            totalPages: meta?.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
