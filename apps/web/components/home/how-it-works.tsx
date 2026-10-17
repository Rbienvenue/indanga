import { useTranslations } from "next-intl";
import { CheckCircle2, ChevronRight, FileText, ListChecks, Search } from "lucide-react";

export function HowItWorks() {
  const t = useTranslations("discovery");
  const steps = [
    {
      icon: Search,
      step: "1",
      title: t("discover"),
      description: t("discoverDescription"),
    },
    {
      icon: ListChecks,
      step: "2",
      title: t("compare"),
      description: t("compareDescription"),
    },
    {
      icon: FileText,
      step: "3",
      title: t("checkDetails"),
      description: t("checkDetailsDescription"),
    },
    {
      icon: CheckCircle2,
      step: "4",
      title: t("continue"),
      description: t("continueDescription"),
    },
  ];

  return (
    <section id="how-it-works" className="border-t bg-background px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-base font-semibold text-foreground">{t("howItWorks")}</h2>
        <ol className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <li key={item.title} className="relative flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-foreground">
                  {item.step}. {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight
                  className="absolute top-2 -right-6 hidden size-4 text-primary/60 lg:block"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
