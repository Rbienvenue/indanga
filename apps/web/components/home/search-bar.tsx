"use client";

import { useTranslations } from "next-intl";
import { Building2, Car, Home, MapPin, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/home/search-input";
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

type SearchBarProps = {
  className?: string;
  /** When set, Search navigates here with the selected filters instead of writing the current URL. */
  redirectTo?: string;
  /** When set, the property type is fixed to this value and the type tabs are hidden. */
  lockedType?: string;
};

function buildSearchHref(
  pathname: string,
  filters: {
    type: string;
    budget: string;
    subType: string;
    province: string;
    district: string;
    sector: string;
    search: string;
  },
) {
  const params = new URLSearchParams();
  if (filters.search.trim() !== "") params.set("search", filters.search.trim());
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.subType !== "all") params.set("subType", filters.subType);
  if (filters.budget !== "any") params.set("budget", filters.budget);
  if (filters.province !== "all") params.set("province", filters.province);
  if (filters.district !== "all") params.set("district", filters.district);
  if (filters.sector !== "all") params.set("sector", filters.sector);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SearchBar({ className, redirectTo, lockedType }: SearchBarProps) {
  const t = useTranslations("discovery");
  const propertyTypes = [
    { value: "homes", label: t("homes"), icon: Home },
    { value: "hotels", label: t("hotelsTab"), icon: Building2 },
    { value: "cars", label: t("cars"), icon: Car },
  ] as const;

  const subTypeOptions: Record<string, readonly { value: string; label: string }[]> = {
    homes: [
      { value: "all", label: t("allPropertyTypes") },
      { value: "1 Bedroom", label: t("oneBedroom") },
      { value: "2 Bedroom", label: t("twoBedrooms") },
      { value: "3 Bedroom", label: t("threeBedrooms") },
      { value: "Family House", label: t("familyHouse") },
      { value: "Villa", label: t("villa") },
      { value: "Economic House", label: t("economicHouse") },
      { value: "House", label: t("house") },
    ],
    hotels: [
      { value: "all", label: t("allHotelTypes") },
      { value: "Apartment", label: t("apartment") },
      { value: "hotel", label: t("hotel") },
      { value: "motel", label: t("motel") },
      { value: "lodge", label: t("lodge") },
      { value: "guesthouse", label: t("guesthouse") },
      { value: "resort", label: t("resort") },
    ],
    cars: [
      { value: "all", label: t("allVehicles") },
      { value: "sedan", label: t("sedan") },
      { value: "van", label: t("van") },
      { value: "suv", label: t("suv") },
      { value: "pickup", label: t("pickup") },
      { value: "bus", label: t("bus") },
    ],
  };

  const budgetOptions = [
    { value: "any", label: t("anyBudget") },
    { value: "50000-200000", label: "RWF 50K – 200K" },
    { value: "200000-500000", label: "RWF 200K – 500K" },
    { value: "500000-", label: "RWF 500K+" },
  ] as const;

  const budgetAnyLabels: Record<string, string> = {
    homes: t("monthlyBudget"),
    hotels: t("nightlyBudget"),
    cars: t("dailyBudget"),
  };

  const router = useRouter();
  const pathname = usePathname();
  const [searchContainer, setSearchContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSearchContainer(document.getElementById("header-property-search"));
  }, [pathname]);
  const { locations, isLoading: isLoadingLocations } = useLocations();
  const [provinceQuery, setProvinceQuery] = useQueryState(
    "province",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [districtQuery, setDistrictQuery] = useQueryState(
    "district",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );
  const [sectorQuery, setSectorQuery] = useQueryState(
    "sector",
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
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );
  const [draftType, setDraftType] = useState("all");
  const [draftSearch, setDraftSearch] = useState("");
  const [inputValue, setInputValue] = useState(searchQuery);
  const [draftBudget, setDraftBudget] = useState("any");
  const [draftSubType, setDraftSubType] = useState("all");
  const [draftProvince, setDraftProvince] = useState("all");
  const [draftDistrict, setDraftDistrict] = useState("all");
  const [draftSector, setDraftSector] = useState("all");

  // The text field stays editable without firing a request per keystroke;
  // it commits to the URL on Search/Enter. Homepage draft mode navigates instead.
  useEffect(() => {
    if (!redirectTo) setInputValue(searchQuery);
  }, [searchQuery, redirectTo]);

  const search = redirectTo ? draftSearch : searchQuery;
  const inputText = redirectTo ? draftSearch : inputValue;

  const propertyType = lockedType ?? (redirectTo ? draftType : typeQuery);
  const budget = redirectTo ? draftBudget : budgetQuery;
  const subType = redirectTo ? draftSubType : subTypeQuery;
  const province = redirectTo ? draftProvince : provinceQuery;
  const district = redirectTo ? draftDistrict : districtQuery;
  const sector = redirectTo ? draftSector : sectorQuery;
  const districtOptions = province !== "all" ? (locations.districts[province] ?? []) : [];
  const sectorOptions =
    province !== "all" && district !== "all" ? (locations.sectors[province]?.[district] ?? []) : [];

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
      setDraftSector("all");
      return;
    }
    void setProvinceQuery(value === "all" ? null : value);
    void setDistrictQuery(null);
    void setSectorQuery(null);
  }

  function handleDistrictChange(value: string) {
    if (redirectTo) {
      setDraftDistrict(value);
      setDraftSector("all");
      return;
    }
    void setDistrictQuery(value === "all" ? null : value);
    void setSectorQuery(null);
  }

  function handleSectorChange(value: string) {
    if (redirectTo) {
      setDraftSector(value);
      return;
    }
    void setSectorQuery(value === "all" ? null : value);
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
          sector,
          search,
        }),
      );
      return;
    }
    void setSearchQuery(inputValue.trim() === "" ? null : inputValue.trim());
    void setTypeQuery(propertyType === "all" ? null : propertyType);
    void setSubTypeQuery(subType === "all" ? null : subType);
    void setBudgetQuery(budget === "any" ? null : budget);
    void setProvinceQuery(provinceQuery === "all" ? null : provinceQuery);
    void setDistrictQuery(districtQuery === "all" ? null : districtQuery);
    void setSectorQuery(sectorQuery === "all" ? null : sectorQuery);
  }

  function handleClearSearch() {
    if (redirectTo) {
      setDraftSearch("");
      return;
    }
    setInputValue("");
    void setSearchQuery(null);
  }

  const searchInput = (
    <SearchInput
      value={inputText}
      onChange={redirectTo ? setDraftSearch : setInputValue}
      onSearch={handleSearch}
      onClear={handleClearSearch}
    />
  );

  return (
    <section className={cn("relative z-20 -mt-10 px-4 sm:px-6 lg:px-8", className)}>
      {searchContainer ? createPortal(searchInput, searchContainer) : null}
      <div className="mx-auto max-w-5xl rounded-xl border border-border/60 bg-card/95 px-5 py-4 shadow-xl shadow-black/10 backdrop-blur-sm sm:px-6">
        <div className="flex flex-col gap-3">
          {!lockedType ? (
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
          ) : null}

          <div className="grid grid-cols-2 items-center gap-2 sm:gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
            <Select
              value={province}
              onValueChange={handleProvinceChange}
              disabled={isLoadingLocations}
            >
              <SelectTrigger className="w-full">
                <MapPin className="size-4 text-muted-foreground" />
                <SelectValue placeholder={isLoadingLocations ? t("loading") : t("allProvinces")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allProvinces")}</SelectItem>
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
                <SelectValue
                  placeholder={province === "all" ? t("provinceFirst") : t("allDistricts")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allDistricts")}</SelectItem>
                {districtOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sector}
              onValueChange={handleSectorChange}
              disabled={district === "all" || isLoadingLocations}
            >
              <SelectTrigger className="w-full">
                <MapPin className="size-4 text-muted-foreground" />
                <SelectValue
                  placeholder={district === "all" ? t("districtFirst") : t("allSectors")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSectors")}</SelectItem>
                {sectorOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
                    {value === "any" ? (budgetAnyLabels[propertyType] ?? label) : label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="col-span-2 w-full font-semibold lg:col-span-1"
              onClick={handleSearch}
            >
              <Search className="size-4" />
              {t("search")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
