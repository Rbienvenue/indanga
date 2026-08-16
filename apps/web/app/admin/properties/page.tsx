"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PropertyStatusBadge,
  type PropertyStatus,
} from "@/components/properties/property-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { fetcher } from "@/lib/fetcher";

type HouseWithOwner = {
  id: string;
  name: string;
  location: string;
  price: number;
  propertyType: string;
  status: PropertyStatus;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
};

function formatRWF(amount: number) {
  return `${amount.toLocaleString()} RWF`;
}

function PropertyActions({ property }: { property: HouseWithOwner }) {
  const queryClient = useQueryClient();

  const invalidateProperties = () => queryClient.invalidateQueries({ queryKey: ["properties"] });

  const publishMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<HouseWithOwner>>(`/admin/properties/${property.id}/publish`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.success("Property published");
      void invalidateProperties();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to publish property");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<HouseWithOwner>>(`/admin/properties/${property.id}/unpublish`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.success("Property moved to pending");
      void invalidateProperties();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to unpublish property");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetcher<ApiResponse<unknown>>(`/admin/properties/${property.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Property deleted");
      void invalidateProperties();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete property");
    },
  });

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/properties/${property.id}/edit`}>
          <Pencil className="size-4" />
          Edit
        </Link>
      </Button>

      {property.status === "PENDING" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending}
        >
          {publishMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Publish
        </Button>
      )}

      {property.status === "AVAILABLE" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => unpublishMutation.mutate()}
          disabled={unpublishMutation.isPending}
        >
          {unpublishMutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Unpublish
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{property.name}&quot; and its associated data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const columns: ColumnDef<HouseWithOwner>[] = [
  {
    accessorKey: "name",
    header: "Property",
    cell: ({ row }) => (
      <Link
        href={`/properties/${row.original.id}`}
        className="inline-flex items-center gap-1 font-medium hover:underline"
      >
        {row.original.name}
        <ExternalLink className="size-3.5" />
      </Link>
    ),
  },
  {
    id: "owner",
    header: "Submitted by",
    accessorFn: (row) => row.owner.name,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.owner.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.owner.email}</p>
      </div>
    ),
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
    cell: ({ row }) => <PropertyStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    size: 240,
    cell: ({ row }) => <PropertyActions property={row.original} />,
  },
];

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = useQuery<PaginationResponse<HouseWithOwner>>({
    queryKey: ["properties", "admin", search, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      return fetcher(`/admin/properties?${params}`);
    },
  });

  const properties = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Properties"
        description={`${meta?.total ?? 0} properties`}
        actions={
          <Button asChild className="gap-2">
            <Link href="/admin/properties/new">
              <PlusCircle className="size-4" />
              Add Property
            </Link>
          </Button>
        }
      />

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
              { label: "Pending", value: "PENDING" },
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
