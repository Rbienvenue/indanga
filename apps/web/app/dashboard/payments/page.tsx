"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, CheckCircle, Clock3, WalletCards } from "lucide-react";
import type { ApiResponse, PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { useSession } from "@/components/providers/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookingKind } from "@/lib/booking-kind";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

type Payment = {
  id: string;
  amount: string;
  bookingAmount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  transactionReference: string;
  createdAt: string;
  booking: {
    id: string;
    bookingId: string | null;
    checkIn: string | null;
    checkOut: string | null;
    nights: number | null;
    house: { id: string; name: string; propertyType: string };
    client: { name: string; email: string };
  };
};

type PaymentStats = { earnings: number; completedPayments: number; pendingPayments: number };
const statusLabels = { PENDING: "Payment pending", COMPLETED: "Paid", FAILED: "Failed" };
const statusColors = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export default function PaymentsPage() {
  const session = useSession();
  const isProvider = session?.user.role === "landlord";
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Payment | null>(null);
  const query = useQuery<PaginationResponse<Payment>>({
    queryKey: ["payments", session?.user.id, status, page],
    enabled: Boolean(session?.user),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "all") params.set("status", status);
      return fetcher(`/payments?${params}`);
    },
  });
  const statsQuery = useQuery<ApiResponse<PaymentStats>>({
    queryKey: ["payment-stats", session?.user.id],
    queryFn: () => fetcher("/payments/stats"),
    enabled: isProvider,
  });
  const stats = statsQuery.data?.data;
  const columns: ColumnDef<Payment>[] = [
    {
      id: "booking",
      header: "Booking",
      accessorFn: (payment) => payment.booking.bookingId ?? payment.booking.id,
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-xs font-medium">
            {row.original.booking.bookingId ?? row.original.booking.id}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{row.original.booking.house.name}</p>
        </div>
      ),
    },
    ...(isProvider
      ? [
          {
            id: "client",
            header: "Client",
            accessorFn: (payment: Payment) => payment.booking.client.name,
          },
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    { accessorKey: "method", header: "Method" },
    {
      id: "amount",
      header: isProvider ? "Booking amount" : "Amount",
      accessorFn: (payment) => (isProvider ? payment.bookingAmount : Number(payment.amount)),
      cell: ({ getValue }) => (
        <span className="font-semibold tabular-nums">{formatPrice(getValue<number>())}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className={statusColors[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "details",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelected(row.original)}
          aria-label={`View transaction ${row.original.transactionReference}`}
        >
          View <ArrowUpRight className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Payments"
        description={
          isProvider
            ? "Track booking earnings and customer payment activity."
            : "Your payment history and transaction details."
        }
      />
      {isProvider &&
        (statsQuery.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Unable to load payment totals.{" "}
            <button className="underline" onClick={() => void statsQuery.refetch()}>
              Retry
            </button>
          </p>
        ) : statsQuery.isLoading ? (
          <section className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Booking earnings · all time"
              value={formatPrice(stats?.earnings ?? 0)}
              icon={<WalletCards className="size-5" />}
            />
            <StatCard
              title="Paid transactions · all time"
              value={stats?.completedPayments ?? 0}
              icon={<CheckCircle className="size-5" />}
            />
            <StatCard
              title="Pending payments"
              value={stats?.pendingPayments ?? 0}
              icon={<Clock3 className="size-5" />}
            />
          </section>
        ))}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Transactions</h2>
            <p className="text-sm text-muted-foreground">
              {isProvider
                ? "Booking amounts exclude Indanga’s service fee. Earnings include paid transactions only."
                : "Amounts include the booking price and service fee."}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/bookings">
              Open bookings <ArrowUpRight />
            </Link>
          </Button>
        </div>
        {query.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Unable to load transactions.{" "}
            <button className="underline" onClick={() => void query.refetch()}>
              Retry
            </button>
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            loading={query.isLoading}
            zebra={false}
            emptyState={<p className="text-sm text-muted-foreground">No transactions found.</p>}
            filterBy={[
              {
                id: "status",
                placeholder: "All statuses",
                value: status,
                onChange: (value) => {
                  setStatus(value);
                  setPage(1);
                },
                options: [
                  { label: "Paid", value: "COMPLETED" },
                  { label: "Payment pending", value: "PENDING" },
                  { label: "Failed", value: "FAILED" },
                ],
              },
            ]}
            pagination={{
              page,
              totalPages: query.data?.meta.totalPages ?? 1,
              onPageChange: setPage,
            }}
          />
        )}
      </section>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Booking</dt>
                <dd className="font-medium">{selected.booking.bookingId ?? selected.booking.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Property / vehicle</dt>
                <dd>{selected.booking.house.name}</dd>
              </div>
              {isProvider && (
                <div>
                  <dt className="text-muted-foreground">Client</dt>
                  <dd>{selected.booking.client.name}</dd>
                </div>
              )}
              {selected.booking.checkIn && selected.booking.checkOut && (
                <div>
                  <dt className="text-muted-foreground">Booking period</dt>
                  <dd>
                    {new Date(selected.booking.checkIn).toLocaleDateString()} →{" "}
                    {new Date(selected.booking.checkOut).toLocaleDateString()}
                    {selected.booking.nights
                      ? ` · ${selected.booking.nights} ${getBookingKind(selected.booking.house.propertyType) === "car" ? "day" : "night"}${selected.booking.nights === 1 ? "" : "s"}`
                      : ""}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">
                  {isProvider ? "Booking amount" : "Amount"}
                </dt>
                <dd className="text-xl font-semibold tabular-nums">
                  {formatPrice(isProvider ? selected.bookingAmount : selected.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{statusLabels[selected.status]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment method</dt>
                <dd>{selected.method}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date</dt>
                <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Transaction reference</dt>
                <dd className="break-all font-mono text-xs">{selected.transactionReference}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
