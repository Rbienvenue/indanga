"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import type { PaginationResponse } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

type PaymentWithBooking = {
  id: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
  booking: {
    house: { name: string };
    client: { name: string };
  };
};

const statusColors: Record<PaymentWithBooking["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export function RecentPayments() {
  const query = useQuery<PaginationResponse<PaymentWithBooking>>({
    queryKey: ["admin-dashboard-payments"],
    queryFn: () => fetcher("/admin/payments?page=1&limit=5"),
  });

  const payments = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Payments</CardTitle>
        <Link href="/admin/payments" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {formatPrice(Number(payment.amount))}
                  </TableCell>
                  <TableCell>{payment.booking.client.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.booking.house.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[payment.status]}>
                      {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No payments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
