import Image from "next/image";
import Link from "next/link";
import { Car, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featuredCars = [
  {
    id: "1",
    name: "Toyota Corolla",
    location: "Kigali",
    price: 65000,
    type: "Economy",
    seats: 5,
    image: "/car1.jpg",
  },
  {
    id: "2",
    name: "Range Rover Evoque",
    location: "Kigali",
    price: 125000,
    type: "Luxury",
    seats: 5,
    image: "/car2.jpg",
  },
  {
    id: "3",
    name: "Honda CR-V",
    location: "Musanze",
    price: 95000,
    type: "SUV",
    seats: 7,
    image: "/car2.jpg",
  },
];

export default function CarsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-background to-background p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Car className="size-4" />
              Flexible rides for every trip
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Find a comfortable car for city travel, airport pickups, or weekend getaways.
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Choose from compact, family, and premium vehicles with easy pickup options and
              transparent daily pricing.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Instant vehicle availability
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Browse ready-to-book cars and reserve the right ride for your next journey.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredCars.map((car) => (
          <Card key={car.id} className="overflow-hidden border-border/60">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={car.image}
                alt={car.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{car.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{car.type}</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {car.seats} seats
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Compass className="size-4" />
                <span>{car.location}</span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-xl font-semibold text-foreground">
                    RWF {car.price.toLocaleString()}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="#">Reserve now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
