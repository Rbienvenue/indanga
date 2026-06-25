import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Homes",
    subtitle: "Find your next home",
    count: "1200+ Listings",
    link: "#",
  },
  {
    title: "Hotels",
    subtitle: "Book the best hotels",
    count: "850+ Listings",
    link: "#",
  },
  {
    title: "Cars",
    subtitle: "Rent a car easily",
    count: "650+ Listings",
    link: "#",
  },
];

export function Categories() {
  return (
    <section id="explore" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Popular Categories
            </h2>
          </div>
          <Link
            href="#"
            className="hidden text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex sm:items-center sm:gap-1"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Category Image Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.link}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/image2.jpeg"
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {/* Text overlay */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-xl font-bold text-white">{cat.title}</h3>
                <p className="mt-1 text-sm text-white/70">{cat.subtitle}</p>
                <p className="mt-2 text-xs font-medium text-white/70">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
