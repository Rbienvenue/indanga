"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Building2, Car, Grid2x2 } from "lucide-react";

interface FavoritesTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FavoritesTabs({ value, onValueChange }: FavoritesTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="mt-5 w-full">
      <TabsList className="h-auto w-full justify-start rounded-xl bg-muted p-1">
        <TabsTrigger
          value="all"
          className="flex items-center gap-2 rounded-lg px-4 py-2"
        >
          <Grid2x2 size={16} />
          All
        </TabsTrigger>

        <TabsTrigger
          value="properties"
          className="flex items-center gap-2 rounded-lg px-4 py-2"
        >
          <Home size={16} />
          Properties
        </TabsTrigger>

        <TabsTrigger
          value="hotels"
          className="flex items-center gap-2 rounded-lg px-4 py-2"
        >
          <Building2 size={16} />
          Hotels
        </TabsTrigger>

        <TabsTrigger
          value="cars"
          className="flex items-center gap-2 rounded-lg px-4 py-2"
        >
          <Car size={16} />
          Cars
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}