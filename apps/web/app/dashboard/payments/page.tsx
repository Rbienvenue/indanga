"use client";

import { useLocale, useTranslations } from "next-intl";
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
import { formatCurrency } from "@/lib/utils";
import { ReceiptDialog } from "@/components/payments/receipt-dialog";

type Payment = {
  id: string;
  amount: string;
  currency: "RWF";
  exchangeRate: string | null;
  serviceFeeAmount: number | null;
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
    months?: number | null;
    nights: number | null;
    house: { id: string; name: string; propertyType: string; currency: string | null };
    client: { name: string; email: string };
  };
};

type PaymentStats = { earnings: number; completedPayments: number; pendingPayments: number };
const statusColors = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const locale = useLocale();
  const statusLabels = {
    PENDING: t("pendingLabel"),
    COMPLETED: t("paid"),
    FAILED: t("failedLabel"),
  };
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
      header: t("booking"),
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
            header: t("client"),
            accessorFn: (payment: Payment) => payment.booking.client.name,
          },
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: t("date"),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(locale),
    },
    {
      accessorKey: "method",
      header: t("method"),
      cell: ({ row }) => (row.original.method === "CARD" ? t("card") : row.original.method),
    },
    {
      id: "amount",
      header: isProvider ? t("bookingAmount") : t("amount"),
      accessorFn: (payment) => (isProvider ? payment.bookingAmount : Number(payment.amount)),
      cell: ({ row, getValue }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(getValue<number>(), row.original.currency, locale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
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
        <div className="flex gap-2">
          {row.original.status === "COMPLETED" ? (
            <ReceiptDialog paymentId={row.original.id} />
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(row.original)}
            aria-label={t("viewTransaction", { reference: row.original.transactionReference })}
          >
            {t("view")}
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t("payments")}
        description={isProvider ? t("providerDescription") : t("customerDescription")}
      />
      {isProvider &&
        (statsQuery.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {t("totalsError")}{" "}
            <button className="underline" onClick={() => void statsQuery.refetch()}>
              {t("retry")}
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
              title={t("earnings")}
              value={formatCurrency(stats?.earnings ?? 0, "RWF", locale)}
              icon={<WalletCards className="size-5" />}
            />
            <StatCard
              title={t("paidTransactions")}
              value={stats?.completedPayments ?? 0}
              icon={<CheckCircle className="size-5" />}
            />
            <StatCard
              title={t("pendingPayments")}
              value={stats?.pendingPayments ?? 0}
              icon={<Clock3 className="size-5" />}
            />
          </section>
        ))}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("transactions")}</h2>
            <p className="text-sm text-muted-foreground">
              {isProvider ? t("providerAmounts") : t("customerAmounts")}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/bookings">
              {t("openBookings")}
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        {query.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {t("transactionsError")}{" "}
            <button className="underline" onClick={() => void query.refetch()}>
              {t("retry")}
            </button>
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={query.data?.data ?? []}
            loading={query.isLoading}
            zebra={false}
            emptyState={<p className="text-sm text-muted-foreground">{t("noTransactions")}</p>}
            filterBy={[
              {
                id: "status",
                placeholder: t("allStatuses"),
                value: status,
                onChange: (value) => {
                  setStatus(value);
                  setPage(1);
                },
                options: [
                  { label: t("paid"), value: "COMPLETED" },
                  { label: t("pendingLabel"), value: "PENDING" },
                  { label: t("failedLabel"), value: "FAILED" },
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
            <DialogTitle>{t("transactionDetails")}</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("booking")}</dt>
                <dd className="font-medium">{selected.booking.bookingId ?? selected.booking.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("propertyVehicle")}</dt>
                <dd>{selected.booking.house.name}</dd>
              </div>
              {isProvider && (
                <div>
                  <dt className="text-muted-foreground">{t("client")}</dt>
                  <dd>{selected.booking.client.name}</dd>
                </div>
              )}
              {getBookingKind(selected.booking.house.propertyType) === "home" ? (
                <div>
                  <dt className="text-muted-foreground">{t("months")}</dt>
                  <dd>{selected.booking.months ?? 1}</dd>
                </div>
              ) : null}
              {selected.booking.checkIn && selected.booking.checkOut && (
                <div>
                  <dt className="text-muted-foreground">{t("period")}</dt>
                  <dd>
                    {new Date(selected.booking.checkIn).toLocaleDateString(locale)} →{" "}
                    {new Date(selected.booking.checkOut).toLocaleDateString(locale)}
                    {selected.booking.nights
                      ? t(
                          getBookingKind(selected.booking.house.propertyType) === "car"
                            ? "durationDays"
                            : "durationNights",
                          { count: selected.booking.nights },
                        )
                      : ""}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">
                  {isProvider ? t("bookingAmount") : t("amount")}
                </dt>
                <dd className="text-xl font-semibold tabular-nums">
                  {formatCurrency(
                    isProvider ? selected.bookingAmount : selected.amount,
                    selected.currency,
                    locale,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("status")}</dt>
                <dd>{statusLabels[selected.status]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("paymentMethod")}</dt>
                <dd>{selected.method === "CARD" ? t("card") : selected.method}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("date")}</dt>
                <dd>{new Date(selected.createdAt).toLocaleString(locale)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("transactionReference")}</dt>
                <dd className="break-all font-mono text-xs">{selected.transactionReference}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
