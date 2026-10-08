"use client";

import type { HouseStatus } from "@indanga/db";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, House, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PaginationResponse } from "@/@types";
import { ListingCard, ListingDetails } from "@/components/dashboard/properties/listing-card";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { HouseWithRooms } from "@/lib/booking-kind";
import { fetcher } from "@/lib/fetcher";

const PAGE_SIZE = 6;
const listingStatuses: HouseStatus[] = ["PENDING", "AVAILABLE", "BOOKED"];

export default function ListingsPage() {
  const session = useSession();
  const ownerId = session?.user?.id;
  const isAgent = session?.user?.role === "landlord";
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const listingsQuery = useQuery<PaginationResponse<HouseWithRooms>>({
    queryKey: ["properties", "listings", ownerId, page, search, status],
    enabled: isAgent && !!ownerId,
    queryFn: () => {
      if (!ownerId) throw new Error("Sign in to view your listings.");
      const params = new URLSearchParams({
        ownerId,
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      return fetcher(`/properties?${params}`);
    },
  });
  const listings = listingsQuery.data?.data ?? [];
  const meta = listingsQuery.data?.meta;
  const selectedListing = listings.find((listing) => listing.id === selectedId) ?? listings[0];
  const hasFilters = !!search || status !== "all";

  if (!isAgent) {
    return (
      <p className="text-sm text-muted-foreground">Listings are available to property providers.</p>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your properties, pricing, and listing details.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus /> Add listing
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          className="relative w-full sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Input
            className="pr-10"
            aria-label="Search listings by name"
            placeholder="Search listings by name"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 size-8 rounded-l-none text-muted-foreground"
            aria-label="Search listings"
          >
            <Search />
          </Button>
        </form>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Listing status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {listingStatuses.map((value) => (
              <SelectItem key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {listingsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : listingsQuery.isError ? (
        <div className="rounded-lg border p-6 text-center">
          <p role="alert" className="text-sm text-muted-foreground">
            Unable to load listings.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => void listingsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
          <House className="size-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">
            {hasFilters ? "No matching listings" : "No listings yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilters
              ? "Try another name or status."
              : "Add your first property to start receiving booking requests."}
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setStatus("all");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button asChild className="mt-4">
              <Link href="/dashboard/properties/new">
                <Plus /> Add listing
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                selected={selectedListing?.id === listing.id}
                onSelect={() => setSelectedId(listing.id)}
              />
            ))}
            {meta && meta.totalPages > 1 ? (
              <nav
                aria-label="Listings pagination"
                className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
              >
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1 || listingsQuery.isFetching}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages || listingsQuery.isFetching}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ChevronRight />
                  </Button>
                </div>
              </nav>
            ) : null}
          </div>
          {selectedListing ? <ListingDetails listing={selectedListing} /> : null}
        </section>
      )}
    </main>
  );
}
