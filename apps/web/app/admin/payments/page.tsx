"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, RefreshCw } from "lucide-react";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { fetcher } from "@/lib/fetcher";
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
    house: { name: string };
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
      fetcher("/payments/callback", {
        method: "POST",
        body: JSON.stringify({
          data: { transaction_id: payment.transactionReference },
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
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
    header: "Amount",
    cell: ({ row }) => <span className="font-medium">{formatPrice(row.original.amount)}</span>,
  },
  {
    id: "tenant",
    header: "Tenant",
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
      <PageHeader title="Payments" description={`${meta?.total ?? 0} total payments`} />

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
    </div>
  );
}
