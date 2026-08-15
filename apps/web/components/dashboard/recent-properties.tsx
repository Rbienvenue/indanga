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

type House = {
  id: string;
  name: string;
  location: string;
  price: number;
  propertyType: string;
  status: "AVAILABLE" | "BOOKED";
};

const statusColors: Record<House["status"], string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  BOOKED: "bg-blue-100 text-blue-700",
};

export function RecentProperties() {
  const query = useQuery<PaginationResponse<House>>({
    queryKey: ["admin-dashboard-properties"],
    queryFn: () => fetcher("/properties?page=1&limit=5"),
  });

  const properties = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Properties</CardTitle>
        <Link href="/admin/properties" className="text-sm text-primary hover:underline">
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
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.propertyType}</TableCell>
                  <TableCell className="text-muted-foreground">{property.location}</TableCell>
                  <TableCell>{formatPrice(property.price)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[property.status]}>
                      {property.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No properties yet.
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
