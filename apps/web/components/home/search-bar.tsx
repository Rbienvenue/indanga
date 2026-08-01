"use client";

import { Building2, Car, Home, MapPin, Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const propertyTypes = [
  { value: "houses", label: "Homes", icon: Home },
  { value: "hotels", label: "Hotels", icon: Building2 },
  { value: "cars", label: "Cars", icon: Car },
] as const;

const budgetOptions = [
  { value: "any", label: "Any budget" },
  { value: "0-350000", label: "Under RWF 350K" },
  { value: "350000-500000", label: "RWF 350K – 500K" },
  { value: "500000-", label: "RWF 500K+" },
] as const;

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const [location, setLocation] = useState("all");
  const [propertyType, setPropertyType] = useQueryState(
    "type",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [budget, setBudget] = useQueryState(
    "budget",
    parseAsString.withDefault("any").withOptions({ shallow: false }),
  );

  return (
    <section className={cn("relative z-20 -mt-6 px-4 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-4xl rounded-xl border border-border/60 bg-card/95 p-5 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <Tabs
            value={propertyType}
            onValueChange={(value) => void setPropertyType(value === "all" ? null : value)}
          >
            <TabsList className="mx-auto w-fit bg-muted p-1">
              <TabsTrigger value="all">All</TabsTrigger>
              {propertyTypes.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="mr-1.5 size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
                  <MapPin className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="Kigali">Kigali, Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Budget</label>
              <Select
                value={budget}
                onValueChange={(value) => void setBudget(value === "any" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end lg:col-start-4">
              <Button
                className="w-full font-semibold"
                onClick={() => {
                  void setPropertyType(propertyType === "all" ? null : propertyType);
                  void setBudget(budget === "any" ? null : budget);
                }}
              >
                <Search className="size-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
