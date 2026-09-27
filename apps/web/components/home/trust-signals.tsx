import { Headphones, ShieldCheck, Tag } from "lucide-react";

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "Reviewed listings",
    description: "We check information submitted by providers before publication.",
    color: "text-emerald-600",
    background: "bg-emerald-100",
  },
  {
    icon: Tag,
    title: "Clear prices",
    description: "See the list price and additional charges before you book.",
    color: "text-blue-600",
    background: "bg-blue-100",
  },
  {
    icon: Headphones,
    title: "Local support",
    description: "Get help from the INDANGA team in Rwanda.",
    color: "text-emerald-600",
    background: "bg-emerald-100",
  },
];

export function TrustSignals() {
  return (
    <section aria-label="Why book with INDANGA" className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
        {trustSignals.map(({ icon: Icon, title, description, color, background }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-4 py-3 shadow-sm"
          >
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${background} ${color}`}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-5 text-foreground">{title}</h2>
              <p className="text-xs leading-4 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}