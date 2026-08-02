import Image from "next/image";
import Link from "next/link";

interface QuickAction {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  position: string;
  bgClass: string;
  textClass: string;
}

const actions: QuickAction[] = [
  {
    title: "Find a House",
    subtitle: "Browse properties",
    href: "/properties?type=houses",
    image: "/image3.jpeg",
    position: "50% 62%",
    bgClass: "bg-accent/60",
    textClass: "text-accent-foreground",
  },
  {
    title: "Book a Hotel",
    subtitle: "Find the best hotels",
    href: "/properties?type=hotels",
    image: "/hero.jpg",
    position: "42% 78%",
    bgClass: "bg-primary/70",
    textClass: "text-primary-foreground",
  },
  {
    title: "Rent a Vehicle",
    subtitle: "Choose a car",
    href: "/properties?type=cars",
    image: "/car1.jpg",
    position: "50% 65%",
    bgClass: "bg-sidebar/80",
    textClass: "text-sidebar-foreground",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group relative flex min-h-[104px] flex-col justify-center overflow-hidden rounded-xl ${action.bgClass} ${action.textClass} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
          >
            {/* Image bleeds in from the right, faded out over the card colour */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[62%]"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, #000 62%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 32%, #000 62%)",
              }}
            >
              <Image
                src={action.image}
                alt=""
                fill
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 20vw"
                style={{ objectPosition: action.position }}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <h3 className="relative z-10 text-base font-semibold drop-shadow-sm">
              {action.title}
            </h3>
            <p className="relative z-10 mt-0.5 text-sm opacity-80 drop-shadow-sm">
              {action.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
