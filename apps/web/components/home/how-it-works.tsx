import { Search, ListChecks, CreditCard, Smile } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Search",
    description: "Choose what you need and search easily.",
  },
  {
    icon: ListChecks,
    step: "2",
    title: "Choose",
    description: "Select the best option that fits you.",
  },
  {
    icon: CreditCard,
    step: "3",
    title: "Book & Pay",
    description: "Book securely and make payment.",
  },
  {
    icon: Smile,
    step: "4",
    title: "Enjoy",
    description: "Enjoy your stay, home or ride.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div key={item.title} className="group relative text-center">
              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-border lg:block" />
              )}

              {/* Step Number Circle */}
              <div className="relative mx-auto mb-5 inline-flex size-20 items-center justify-center rounded-2xl bg-[#0A0A2C]/10 text-primary transition-all duration-300 group-hover:bg-[#0A0A2C] group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                <item.icon className="size-8" />
                <span className="absolute -top-1.5 -right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {item.step}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
