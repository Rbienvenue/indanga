"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import type { ColumnDef } from "@tanstack/react-table";

type PaymentWithBooking = {
  id: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  transactionReference: string;
  createdAt: string;
  booking: {
    id: string;
    house: { name: string; location: string };
    client: { name: string; email: string };
  };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

function formatRWF(amount: string | number) {
  return `${Number(amount).toLocaleString()} RWF`;
}

const columns: ColumnDef<PaymentWithBooking>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-medium">{formatRWF(row.original.amount)}</span>,
  },
  {
    id: "property",
    header: "Property",
    accessorFn: (row) => row.booking.house.name,
    cell: ({ row }) => (
      <div>
        <p>{row.original.booking.house.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.booking.house.location}</p>
      </div>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  // {
  //   accessorKey: "transactionReference",
  //   header: "Reference",
  //   cell: ({ row }) => (
  //     <span className="font-mono text-xs text-muted-foreground">
  //       {row.original.transactionReference}
  //     </span>
  //   ),
  // },
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

function EmptyPayments() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CreditCard className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No payments yet</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Payments will appear here once you book a property.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/search">Explore Listings</Link>
      </Button>
    </div>
  );
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = useQuery<PaginationResponse<PaymentWithBooking>>({
    queryKey: ["dashboard-payments", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/payments?${params}`);
    },
  });

  const payments = query.data?.data ?? [];
  const meta = query.data?.meta;

  if (!query.isLoading && payments.length === 0 && statusFilter === "all") {
    return (
      <main>
        <PageHeader title="Payments" description="Your payment history" />
        <EmptyPayments />
      </main>
    );
  }

  return (
    <main>
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
    </main>
  );
}
