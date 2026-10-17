"use client";

import { useTranslations } from "next-intl";
import type { House } from "@/@types";
import { useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PaginationResponse } from "@/@types";
import { fetcher } from "@/lib/fetcher";

export function Categories() {
  const t = useTranslations("discovery");
  const categories = [
    {
      title: t("homes"),
      subtitle: t("homeSubtitle"),
      propertyTypeFilter: "House,Studio",
      image: "/image2.jpeg",
      link: "/homes",
    },
    {
      title: t("hotels"),
      subtitle: t("hotelSubtitle"),
      propertyTypeFilter: "Hotel,Apartment",
      image: "/room3.jpg",
      link: "/hotels",
    },
    {
      title: t("cars"),
      subtitle: t("carSubtitle"),
      propertyTypeFilter: "Car",
      image: "/car2.jpg",
      link: "/cars",
    },
  ];

  const countQueries = useQueries({
    queries: categories.map((cat) => ({
      queryKey: ["properties", "category-count", cat.propertyTypeFilter],
      queryFn: () =>
        fetcher<PaginationResponse<House>>(
          `/properties?page=1&limit=1&status=AVAILABLE&propertyType=${encodeURIComponent(cat.propertyTypeFilter)}`,
        ),
      staleTime: 60_000,
    })),
  });

  return (
    <section id="explore" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("popularCategories")}
            </h2>
          </div>
          <Link
            href="/properties"
            className="hidden text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex sm:items-center sm:gap-1"
          >
            {t("viewAll")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Category Image Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => {
            const countQuery = countQueries[index];
            const total = countQuery?.data?.meta.total;
            const isLoading = countQuery?.isLoading ?? true;
            return (
              <Link
                key={cat.title}
                href={cat.link}
                className="group relative overflow-hidden rounded-2xl"
              >
                {/* Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-bold text-white">{cat.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{cat.subtitle}</p>
                  <p className="mt-2 text-xs font-medium text-white/70">
                    {isLoading
                      ? "…"
                      : total === undefined
                        ? ""
                        : t("listingCount", { count: total })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
