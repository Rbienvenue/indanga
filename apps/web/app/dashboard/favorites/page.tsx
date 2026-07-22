"use client";

import { useState } from "react";

import FavoritesHeader from "@/components/dashboard/favorites/favorites-header";
import { FavoritesGrid } from "./favorites-grid";
import { FavoritesTabs } from "./favorites-tab";

const favorites = [
    {
        id: "prop-1",
        type: "property" as const,
        data: {
            title: "Modern Apartment",
            location: "Kacyiru, Kigali",
            price: 250000,
            media: ["/image1.jpeg"],
            bedrooms: 2,
            bathrooms: 2,
        },
    },
    {
        id: "hotel-1",
        type: "hotel" as const,
        data: {
            title: "Skyline Suites",
            location: "Kigali City Center",
            price: 180000,
            media: ["/image2.jpeg"],
            bedrooms: 1,
            bathrooms: 1,
        },
    },
    {
        id: "car-1",
        type: "car" as const,
        data: {
            title: "Luxury SUV",
            location: "Remera, Kigali",
            price: 120000,
            media: ["/image3.jpeg"],
            bedrooms: 0,
            bathrooms: 0,
        },
    },
];

export default function Page() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("recent");
    const [activeTab, setActiveTab] = useState("all");

    return (
        <main>
            <FavoritesHeader
                search={search}
                onSearchChange={setSearch}
                sort={sort}
                onSortChange={setSort}
            />
            <FavoritesTabs value={activeTab} onValueChange={setActiveTab} />
            <FavoritesGrid favorites={favorites} activeTab={activeTab} />
        </main>
    );
}
