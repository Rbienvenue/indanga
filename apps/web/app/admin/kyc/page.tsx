"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { KycReviewDialog, type KycLandlord } from "@/components/admin/kyc-review-dialog";
import { fetcher } from "@/lib/fetcher";

const statusBadgeVariant: Record<string, string> = {
  NOT_SUBMITTED: "bg-gray-100 text-gray-700",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const columns: ColumnDef<KycLandlord>[] = [
  {
    accessorKey: "name",
    header: "Agent",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {row.original.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nationalId",
    header: "National ID",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.nationalId ?? "—"}</span>
    ),
  },
  {
    accessorKey: "kycStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={statusBadgeVariant[row.original.kycStatus] ?? ""}
      >
        {row.original.kycStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "kycSubmittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.kycSubmittedAt
          ? new Date(row.original.kycSubmittedAt).toLocaleDateString()
          : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    size: 48,
    cell: ({ row }) => <KycReviewDialog landlord={row.original} />,
  },
];

export default function AdminKycPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const kycQuery = useQuery<PaginationResponse<KycLandlord>>({
    queryKey: ["admin-kyc", search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/kyc?${params}`);
    },
  });

  const landlords = kycQuery.data?.data ?? [];
  const meta = kycQuery.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="KYC"
        description={`${meta?.total ?? 0} agents awaiting or with verification`}
      />

      <DataTable
        columns={columns}
        data={landlords}
        loading={kycQuery.isLoading}
        search={{
          placeholder: "Search by name, email or national ID...",
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        filterBy={[
          {
            id: "status",
            placeholder: "All Statuses",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1);
            },
            options: [
              { label: "Not Submitted", value: "NOT_SUBMITTED" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
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
