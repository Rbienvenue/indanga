"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
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
    mutationFn: () =>
      fetcher(`/admin/reviews/${reviewId}`, { method: "DELETE" }),
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
      <PageHeader
        title="Reviews"
        description={`${meta?.total ?? 0} total reviews`}
      />

      <Card>
        <CardHeader />
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No reviews found.
            </p>
          ) : (
            <div className="space-y-2">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{review.tenant.name}</p>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {review.house.name} &middot;{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                    <DeleteReviewButton reviewId={review.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
