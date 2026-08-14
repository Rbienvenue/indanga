"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

type HouseWithOwner = {
  id: string;
  name: string;
  location: string;
  price: number;
  propertyType: string;
  status: "AVAILABLE" | "BOOKED";
  createdAt: string;
  ownerId: string;
};

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  BOOKED: "bg-blue-100 text-blue-700",
};

function formatRWF(amount: number) {
  return `${amount.toLocaleString()} RWF`;
}

const columns: ColumnDef<HouseWithOwner>[] = [
  {
    accessorKey: "name",
    header: "Property",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.location}</span>,
  },
  {
    accessorKey: "propertyType",
    header: "Type",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatRWF(row.original.price),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusColors[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    size: 48,
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" className="size-8" asChild>
        <Link href={`/properties/${row.original.id}`}>
          <ExternalLink className="size-4" />
        </Link>
      </Button>
    ),
  },
];

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = useQuery<PaginationResponse<HouseWithOwner>>({
    queryKey: ["admin-properties", search, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/properties?${params}`);
    },
  });

  const properties = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Properties" description={`${meta?.total ?? 0} properties`} />

      <DataTable
        columns={columns}
        data={properties}
        loading={query.isLoading}
        search={{
          placeholder: "Search by name...",
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
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
              { label: "Available", value: "AVAILABLE" },
              { label: "Booked", value: "BOOKED" },
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
