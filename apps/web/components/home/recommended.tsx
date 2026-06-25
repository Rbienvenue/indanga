import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  BedDouble,
  Bath,
  Maximize,
  Wifi,
  Coffee,
  Waves,
  Gauge,
  Fuel,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const listings = [
  {
    title: "Modern Apartment",
    type: "home",
    location: "Kigali, Nyarutarama",
    price: "$650",
    priceUnit: "/ month",
    badge: "Featured",
    badgeColor: "bg-primary text-primary-foreground",
    features: [
      { icon: BedDouble, label: "2 Beds" },
      { icon: Bath, label: "2 Baths" },
      { icon: Maximize, label: "120m²" },
    ],
  },
  {
    title: "Kigali Marriott Hotel",
    type: "hotel",
    location: "Kigali, Rwanda",
    price: "$120",
    priceUnit: "/ night",
    rating: "4.8",
    ratingCount: "1020",
    badge: "Featured",
    badgeColor: "bg-blue-500 text-white",
    features: [
      { icon: Wifi, label: "Free Wi-Fi" },
      { icon: Coffee, label: "Breakfast" },
      { icon: Waves, label: "Pool" },
    ],
  },
  {
    title: "Toyota RAV4 2022",
    type: "car",
    location: "Kigali, Rwanda",
    price: "$45",
    priceUnit: "/ day",
    badge: "Featured",
    badgeColor: "bg-emerald-500 text-white",
    features: [
      { icon: Gauge, label: "Automatic" },
      { icon: Fuel, label: "Petrol" },
      { icon: Users, label: "5 Seats" },
    ],
  },
];

export function Recommended() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Recommended For You
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <ArrowLeft className="size-4" />
            </button>
            <button className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Listing Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.title}
              className="group overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/5"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="/image2.jpeg"
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Badge */}
                <Badge
                  className={`absolute top-3 left-3 ${listing.badgeColor} rounded-md px-2.5 py-1 text-xs font-semibold shadow-md`}
                >
                  {listing.badge}
                </Badge>
                {/* Favorite */}
                <button className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500">
                  <Heart className="size-4" />
                </button>
              </div>

              <CardContent className="p-4">
                {/* Title */}
                <h3 className="text-base font-semibold text-foreground">
                  {listing.title}
                </h3>
                {/* Location */}
                <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {listing.location}
                </div>

                {/* Rating (for hotels) */}
                {listing.rating && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Star className="size-3.5 fill-primary text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {listing.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({listing.ratingCount})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">
                    {listing.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {listing.priceUnit}
                  </span>
                </div>

                {/* Features */}
                <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
                  {listing.features.map((feat) => (
                    <div
                      key={feat.label}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <feat.icon className="size-3.5" />
                      {feat.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
