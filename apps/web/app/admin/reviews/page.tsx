"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { fetcher } from "@/lib/fetcher";

type ReviewWithDetails = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  house: { id: string; name: string };
  tenant: { id: string; name: string; email: string };
};

function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => fetcher(`/admin/reviews/${reviewId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Review deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete review");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this review?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the review. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

const columns: ColumnDef<ReviewWithDetails>[] = [
  {
    id: "tenant",
    header: "Tenant",
    accessorFn: (row) => row.tenant.name,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.tenant.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.tenant.email}</p>
      </div>
    ),
  },
  {
    id: "property",
    header: "Property",
    accessorFn: (row) => row.house.name,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => <RatingStars rating={row.original.rating} />,
  },
  {
    accessorKey: "comment",
    header: "Comment",
    enableSorting: false,
    cell: ({ row }) => (
      <p className="max-w-sm truncate text-muted-foreground whitespace-normal">
        {row.original.comment}
      </p>
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
    id: "actions",
    header: "",
    enableSorting: false,
    size: 48,
    cell: ({ row }) => <DeleteReviewButton reviewId={row.original.id} />,
  },
];

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const query = useQuery<PaginationResponse<ReviewWithDetails>>({
    queryKey: ["admin-reviews", page],
    queryFn: () => fetcher(`/admin/reviews?page=${page}&limit=${limit}`),
  });

  const reviews = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Reviews" description={`${meta?.total ?? 0} total reviews`} />

      <DataTable
        columns={columns}
        data={reviews}
        loading={query.isLoading}
        pagination={{
          page,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
