"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, Building2, Car, MapPin, ChevronDown, Search } from "lucide-react";

export function SearchBar() {
  return (
    <section className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-md border border-border/50 bg-card/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm">
        <Tabs defaultValue="homes" className="gap-4">
          <TabsList className="mx-auto w-fit bg-muted p-1">
            <TabsTrigger value="homes">
              <Home className="mr-1.5 size-4" />
              Homes
            </TabsTrigger>
            <TabsTrigger value="hotels">
              <Building2 className="mr-1.5 size-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="cars">
              <Car className="mr-1.5 size-4" />
              Cars
            </TabsTrigger>
          </TabsList>

          {/* All tab contents share the same search form */}
          {["homes", "hotels", "cars"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <button className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground transition-colors hover:border-primary/50">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-left">Kigali, Rwanda</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <button className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground transition-colors hover:border-primary/50">
                    <span className="flex-1 text-left">All Type</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Budget</label>
                  <button className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm text-foreground transition-colors hover:border-primary/50">
                    <span className="flex-1 text-left">Any Budget</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Search Button */}
                <div className="flex flex-col justify-end">
                  <Button size="lg" className="h-10 w-full rounded-lg font-semibold">
                    <Search className="mr-1.5 size-4" />
                    Search
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
