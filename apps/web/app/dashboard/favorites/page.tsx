"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { PaginationResponse } from "@/@types";
import FavoritesHeader from "@/components/dashboard/favorites/favorites-header";
import { fetcher } from "@/lib/fetcher";
import { FavoritesGrid, type FavoriteWithHouse } from "./favorites-grid";

function effectivePrice(house: {
  price: number | null;
  rooms?: { price: number }[];
}): number {
  if (house.price != null) return house.price;
  const prices = (house.rooms ?? []).map((room) => room.price);
  return prices.length > 0 ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
}

export default function Page() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  const favoritesQuery = useQuery<PaginationResponse<FavoriteWithHouse>>({
    queryKey: ["properties", "favorites"],
    queryFn: () => fetcher("/properties/favorites"),
  });

  const favorites = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = (favoritesQuery.data?.data ?? []).filter(({ house }) =>
      [house.name, house.location, house.address, house.propertyType].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      ),
    );

    return filtered.toSorted((a, b) => {
      if (sort === "price-asc") return effectivePrice(a.house) - effectivePrice(b.house);
      if (sort === "price-desc") return effectivePrice(b.house) - effectivePrice(a.house);
      if (sort === "alphabetical") return a.house.name.localeCompare(b.house.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [favoritesQuery.data?.data, search, sort]);

  return (
    <main>
      <FavoritesHeader
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />
      <FavoritesGrid
        favorites={favorites}
        isLoading={favoritesQuery.isLoading}
        isError={favoritesQuery.isError}
      />
    </main>
  );
}
