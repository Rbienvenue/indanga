"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { ApiResponse } from "@/@types";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookingKind } from "@/lib/booking-kind";
import { fetcher } from "@/lib/fetcher";
import { calcServiceFee, type ServiceFee, type ServiceFeeType } from "@/lib/service-fee";
import { formatPrice } from "@/lib/utils";

const feeSchema = z
  .object({
    feeType: z.enum(["percentage", "fixed"]),
    amount: z.number().int().min(0, "Amount must be 0 or more"),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.feeType === "percentage" && data.amount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Percentage cannot exceed 100",
      });
    }
  });

type FeeValues = z.infer<typeof feeSchema>;

const KIND_META: { kind: BookingKind; title: string; description: string }[] = [
  {
    kind: "home",
    title: "Homes",
    description: "Monthly rentals. One fee rule for all home listings.",
  },
  {
    kind: "hotel",
    title: "Hotels",
    description: "Nightly stays. One fee rule for all hotel listings.",
  },
  {
    kind: "car",
    title: "Cars",
    description: "Daily rentals. One fee rule for all car listings.",
  },
];

const PREVIEW_SUBTOTAL = 100000;

function AmountInput({
  value,
  onChange,
  onBlur,
  max,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  max?: number;
  disabled?: boolean;
}) {
  // Local text state so the field can be cleared while typing.
  // The form value only updates once the text parses to a number.
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(null);
  }, [value]);

  return (
    <Input
      type="number"
      min={0}
      max={max}
      className="h-11"
      disabled={disabled}
      value={text ?? value ?? 0}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        if (raw === "") return;
        const next = Math.floor(Number(raw));
        if (!Number.isNaN(next)) onChange(Math.max(next, 0));
      }}
      onBlur={(event) => {
        if (event.target.value === "") onChange(0);
        setText(null);
        onBlur();
      }}
    />
  );
}

export default function AdminSettingsPage() {
  const feesQuery = useQuery({
    queryKey: ["admin-service-fees"],
    queryFn: () => fetcher<ApiResponse<ServiceFee[]>>("/admin/service-fees"),
  });

  const fees = feesQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Settings" description="Platform configuration" />

      <Tabs defaultValue="fees">
        <TabsList>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>
        <TabsContent value="fees" className="mt-4">
          {feesQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {KIND_META.map((meta) => (
                <ServiceFeeCard
                  key={meta.kind}
                  meta={meta}
                  initial={fees.find((fee) => fee.bookingKind === meta.kind) ?? null}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ServiceFeeCard({
  meta,
  initial,
}: {
  meta: { kind: BookingKind; title: string; description: string };
  initial: ServiceFee | null;
}) {
  const queryClient = useQueryClient();
  const form = useForm<FeeValues, unknown, FeeValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      feeType: (initial?.feeType ?? "percentage") as ServiceFeeType,
      amount: initial?.amount ?? 5,
      isActive: initial?.isActive ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      feeType: (initial?.feeType ?? "percentage") as ServiceFeeType,
      amount: initial?.amount ?? 5,
      isActive: initial?.isActive ?? true,
    });
  }, [form, initial]);

  const mutation = useMutation({
    mutationFn: (values: FeeValues) =>
      fetcher<ApiResponse<ServiceFee>>(`/admin/service-fees/${meta.kind}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-fees"] });
      toast.success(`${meta.title} fee updated`);
    },
    onError: (error) => {
      toast.error("Could not update fee", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const feeType = useWatch({ control: form.control, name: "feeType" });
  const amount = useWatch({ control: form.control, name: "amount" });
  const isActive = useWatch({ control: form.control, name: "isActive" });
  const preview = calcServiceFee(PREVIEW_SUBTOTAL, {
    bookingKind: meta.kind,
    feeType: feeType as ServiceFeeType,
    amount: Number(amount) || 0,
    isActive,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meta.title}</CardTitle>
        <CardDescription>{meta.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="feeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (RWF)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{feeType === "fixed" ? "Amount (RWF)" : "Amount (%)"}</FormLabel>
                  <FormControl>
                    <AmountInput
                      value={field.value}
                      max={feeType === "percentage" ? 100 : undefined}
                      disabled={mutation.isPending}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-start gap-2 text-sm leading-5">
                    <input
                      type="checkbox"
                      checked={field.value}
                      disabled={mutation.isPending}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="mt-1 size-4 shrink-0 accent-primary"
                    />
                    <span>
                      <span className="font-semibold">Fee active</span>
                      <span className="block text-muted-foreground">
                        When off, no service fee is charged for {meta.title.toLowerCase()}.
                      </span>
                    </span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm">
              <p className="text-xs font-medium text-muted-foreground">
                Example on a {formatPrice(PREVIEW_SUBTOTAL)} subtotal
              </p>
              <p className="mt-0.5 font-semibold">
                Service fee: {preview > 0 ? formatPrice(preview) : "Free"}
              </p>
            </div>
            <Button type="submit" className="h-10 w-full font-bold" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Saving...
                </>
              ) : (
                "Save fee"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
