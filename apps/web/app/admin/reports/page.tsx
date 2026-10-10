"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { PaginationResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";

type Report = {
  id: string;
  houseId: string | null;
  listingName: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  reporter: { name: string; email: string } | null;
};
const schema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  reviewNote: z.string().trim().min(3, "Add a review note").max(1000),
});

export default function ReportsPage() {
  const [status, setStatus] = useState("OPEN");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Report | null>(null);
  const client = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { status: "RESOLVED", reviewNote: "" },
  });
  const query = useQuery<PaginationResponse<Report>>({
    queryKey: ["admin-reports", status, page],
    queryFn: () =>
      fetcher(`/admin/reports?page=${page}&limit=20${status === "all" ? "" : `&status=${status}`}`),
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      fetcher(`/admin/reports/${selected!.id}`, { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("Report reviewed");
      setSelected(null);
      void client.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "listingName",
      header: "Listing",
      cell: ({ row }) =>
        row.original.houseId ? (
          <Link className="underline" href={`/properties/${row.original.houseId}`}>
            {row.original.listingName}
          </Link>
        ) : (
          row.original.listingName
        ),
    },
    {
      id: "reporter",
      header: "Reporter",
      cell: ({ row }) => (
        <div>
          {row.original.reporter?.name ?? "Deleted account"}
          <p className="text-xs text-muted-foreground">{row.original.reporter?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Concern",
      cell: ({ row }) => <p className="max-w-sm truncate">{row.original.reason}</p>,
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            form.reset();
            setSelected(row.original);
          }}
        >
          {row.original.status === "OPEN" ? "Review" : "View"}
        </Button>
      ),
    },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Listing reports"
        description={`${query.data?.meta.total ?? 0} reports in this view`}
      />
      {query.isError ? (
        <p role="alert" className="text-destructive">
          {query.error.message}
        </p>
      ) : null}
      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        filterBy={[
          {
            id: "status",
            placeholder: "All reports",
            value: status,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            options: [
              { label: "Open", value: "OPEN" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Dismissed", value: "DISMISSED" },
            ],
          },
        ]}
        pagination={{ page, totalPages: query.data?.meta.totalPages ?? 1, onPageChange: setPage }}
      />
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.listingName}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap break-words text-sm">{selected?.reason}</p>
          {selected?.status === "OPEN" ? (
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="DISMISSED">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reviewNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review note</FormLabel>
                      <FormControl>
                        <Textarea {...field} maxLength={1000} disabled={mutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Saving records your review. Manage any listing changes from the listings page.
                </p>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "Save review"}
                </Button>
              </form>
            </Form>
          ) : (
            <div>
              <p className="whitespace-pre-wrap break-words text-sm">{selected?.reviewNote}</p>
              {selected?.reviewedAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reviewed {new Date(selected.reviewedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
