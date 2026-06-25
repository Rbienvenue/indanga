import { ShieldCheck, Lock, DollarSign, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted & Verified",
    description: "All listings are verified for your safety.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Pay securely through our trusted payment system.",
  },
  {
    icon: DollarSign,
    title: "Best Prices",
    description: "We offer competitive prices with great value.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We are here to help you anytime.",
  },
];

export function WhyChoose() {
  return (
    <section id="about" className="bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose INDANGA?
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/50 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="flex flex-col items-center gap-4 pt-6">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
