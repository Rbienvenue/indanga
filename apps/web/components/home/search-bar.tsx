"use client";

import { Building2, Car, Home, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useLocations } from "@/hooks/use-locations";
import { cn } from "@/lib/utils";

const propertyTypes = [
  { value: "homes", label: "Homes", icon: Home },
  { value: "hotels", label: "Hotels", icon: Building2 },
  { value: "cars", label: "Cars", icon: Car },
] as const;

const subTypeOptions: Record<string, readonly { value: string; label: string }[]> = {
  homes: [
    { value: "all", label: "All Type" },
    { value: "1 Bedroom", label: "1 Bedroom" },
    { value: "2 Bedroom", label: "2 Bedroom" },
    { value: "3 Bedroom", label: "3 Bedroom" },
    { value: "Apartment", label: "Apartment" },
    { value: "Family House", label: "Family House" },
    { value: "Villa", label: "Villa" },
    { value: "Economic House", label: "Economic House" },
    { value: "House", label: "House" },
  ],
  hotels: [
    { value: "all", label: "All Type" },
    { value: "hotel", label: "Hotel" },   
    { value: "motel", label: "Motel" },
    { value: "lodge", label: "Lodge" },
    { value: "guesthouse", label: "Guesthouse" },
    { value: "resort", label: "Resort" },
  ],
  cars: [
    { value: "all", label: "All Type" },
    { value: "sedan", label: "Sedan" },
    { value: "van", label: "Van" },
    { value: "suv", label: "SUV" },
    { value: "pickup", label: "Pickup" },
    { value: "bus", label: "Bus" },
  ],
};

const budgetOptions = [
  { value: "any", label: "Any Budget" },
  { value: "50000-100000", label: "RWF 50K – 100K" },
  { value: "100000-150000", label: "RWF 100K – 150K" },
  { value: "150000-200000", label: "RWF 150K – 200K" },
  { value: "200000-250000", label: "RWF 200K – 250K" },
  { value: "250000-300000", label: "RWF 250K – 300K" },
  { value: "300000-350000", label: "RWF 300K – 350K" },
] as const;

type SearchBarProps = {
  className?: string;
  /** When set, Search navigates here with the selected filters instead of writing the current URL. */
  redirectTo?: string;
};

function buildSearchHref(
  pathname: string,
  filters: { type: string; budget: string; subType: string; province: string; district: string },
) {
  const params = new URLSearchParams();
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.subType !== "all") params.set("subType", filters.subType);
  if (filters.budget !== "any") params.set("budget", filters.budget);
  if (filters.province !== "all") params.set("province", filters.province);
  if (filters.district !== "all") params.set("district", filters.district);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SearchBar({ className, redirectTo }: SearchBarProps) {
  const router = useRouter();
  const { locations, isLoading: isLoadingLocations } = useLocations();
  const [provinceQuery, setProvinceQuery] = useQueryState(
    "province",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [districtQuery, setDistrictQuery] = useQueryState(
    "district",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [typeQuery, setTypeQuery] = useQueryState(
    "type",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [subTypeQuery, setSubTypeQuery] = useQueryState(
    "subType",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [budgetQuery, setBudgetQuery] = useQueryState(
    "budget",
    parseAsString.withDefault("any").withOptions({ shallow: false }),
  );
  const [draftType, setDraftType] = useState("all");
  const [draftBudget, setDraftBudget] = useState("any");
  const [draftSubType, setDraftSubType] = useState("all");
  const [draftProvince, setDraftProvince] = useState("all");
  const [draftDistrict, setDraftDistrict] = useState("all");

  const propertyType = redirectTo ? draftType : typeQuery;
  const budget = redirectTo ? draftBudget : budgetQuery;
  const subType = redirectTo ? draftSubType : subTypeQuery;
  const province = redirectTo ? draftProvince : provinceQuery;
  const district = redirectTo ? draftDistrict : districtQuery;
  const districtOptions = province !== "all" ? (locations.districts[province] ?? []) : [];

  function handleTypeChange(value: string) {
    setDraftSubType("all");
    if (redirectTo) {
      setDraftType(value);
      return;
    }
    void setTypeQuery(value === "all" ? null : value);
    void setSubTypeQuery(null);
  }

  function handleSubTypeChange(value: string) {
    if (redirectTo) {
      setDraftSubType(value);
      return;
    }
    void setSubTypeQuery(value === "all" ? null : value);
  }

  function handleProvinceChange(value: string) {
    if (redirectTo) {
      setDraftProvince(value);
      setDraftDistrict("all");
      return;
    }
    void setProvinceQuery(value === "all" ? null : value);
    void setDistrictQuery(null);
  }

  function handleDistrictChange(value: string) {
    if (redirectTo) {
      setDraftDistrict(value);
      return;
    }
    void setDistrictQuery(value === "all" ? null : value);
  }

  function handleBudgetChange(value: string) {
    if (redirectTo) {
      setDraftBudget(value);
      return;
    }
    void setBudgetQuery(value === "any" ? null : value);
  }

  function handleSearch() {
    if (redirectTo) {
      router.push(
        buildSearchHref(redirectTo, {
          type: propertyType,
          budget,
          subType,
          province,
          district,
        }),
      );
      return;
    }
    void setTypeQuery(propertyType === "all" ? null : propertyType);
    void setSubTypeQuery(subType === "all" ? null : subType);
    void setBudgetQuery(budget === "any" ? null : budget);
    void setProvinceQuery(provinceQuery === "all" ? null : provinceQuery);
    void setDistrictQuery(districtQuery === "all" ? null : districtQuery);
  }

  return (
    <section className={cn("relative z-20 -mt-10 px-4 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-5xl rounded-xl border border-border/60 bg-card/95 px-5 py-4 shadow-xl shadow-black/10 backdrop-blur-sm sm:px-6">
        <div className="flex flex-col gap-3">
          <Tabs value={propertyType} onValueChange={handleTypeChange}>
            <TabsList className="mx-auto w-fit bg-muted p-1">
              {propertyTypes.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="mr-1.5 size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <Select value={province} onValueChange={handleProvinceChange} disabled={isLoadingLocations}>
              <SelectTrigger className="w-full">
                <MapPin className="size-4 text-muted-foreground" />
                <SelectValue placeholder={isLoadingLocations ? "Loading..." : "All provinces"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {locations.provinces.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={district}
              onValueChange={handleDistrictChange}
              disabled={province === "all" || isLoadingLocations}
            >
              <SelectTrigger className="w-full">
                <MapPin className="size-4 text-muted-foreground" />
                <SelectValue placeholder={province === "all" ? "Select province first" : "All districts"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districtOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subType} onValueChange={handleSubTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(subTypeOptions[propertyType] ?? subTypeOptions.homes).map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={budget} onValueChange={handleBudgetChange}>
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

            <Button className="w-full font-semibold" onClick={handleSearch}>
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
