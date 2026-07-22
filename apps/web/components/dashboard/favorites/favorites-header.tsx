"use client";

import { Heart, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";


interface FavoritesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

export default function FavoritesHeader({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: FavoritesHeaderProps) {
  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mt-5">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-6 w-6 fill-primary text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Favorites
            </h1>

            <p className="text-muted-foreground">
              Your saved places and vehicles, ready whenever you are.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search favorites..."
            className="pl-10"
          />
        </div>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="recent">
              Recently Added
            </SelectItem>

            <SelectItem value="price-asc">
              Price: Low → High
            </SelectItem>

            <SelectItem value="price-desc">
              Price: High → Low
            </SelectItem>

            <SelectItem value="rating">
              Highest Rated
            </SelectItem>

            <SelectItem value="alphabetical">
              Alphabetical
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}