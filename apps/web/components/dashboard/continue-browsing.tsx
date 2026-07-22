import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "../product-card";
export const mockHouses = [
    {
        id: "1",
        name: "Modern Apartment",
        location: "Kacyiru, Kigali",
        price: 250000,
        media: [
            "/image1.jpeg",
        ],
        bedrooms: 2,
        bathrooms: 2,
    },
    {
        id: "2",
        name: "Luxury Villa",
        location: "Nyarutarama, Kigali",
        price: 850000,
        media: [
            "/image2.jpeg",
        ],
        bedrooms: 5,
        bathrooms: 4,
    },
    {
        id: "3",
        name: "Cozy Studio",
        location: "Kimihurura, Kigali",
        price: 180000,
        media: [
            "/image3.jpeg",
        ],
        bedrooms: 1,
        bathrooms: 1,
    },
    {
        id: "4",
        name: "Family Home",
        location: "Remera, Kigali",
        price: 450000,
        media: [
            "/image2.jpeg",
        ],
        bedrooms: 4,
        bathrooms: 3,
    },
    {
        id: "5",
        name: "Green Villa",
        location: "Kibagabaga, Kigali",
        price: 600000,
        media: [
            "/image3.jpeg",
        ],
        bedrooms: 4,
        bathrooms: 4,
    },
    {
        id: "6",
        name: "City Loft",
        location: "Kiyovu, Kigali",
        price: 320000,
        media: [
            "/image1.jpeg",
        ],
        bedrooms: 2,
        bathrooms: 2,
    },
];

export function ContinueBrowsing() {
    if (!mockHouses.length) return null;

    return (
        <section className="w-full space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Continue Browsing
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Pick up where you left off.
                    </p>
                </div>

                <Button asChild variant="ghost">
                    <Link href="/houses">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {mockHouses.map((house) => (
                    <ProductCard
                        key={house.id}
                        id={house.id}
                        href={`/houses/${house.id}`}
                        name={house.name}
                        location={house.location}
                        price={house.price}
                        media={house.media}
                        bedrooms={house.bedrooms}
                        bathrooms={house.bathrooms}
                        badge="Featured"
                    />
                ))}
            </div>
        </section>
    );
}