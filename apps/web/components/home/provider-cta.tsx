import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProviderCTA() {
  const t = useTranslations("discovery");
  return (
    <section className="px-4 py-2 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex min-h-24 max-w-7xl items-center overflow-hidden rounded-md border border-border bg-muted px-5 py-4 sm:px-8">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            {t("providerHeading")}
          </h2>
          <p className="mt-1 max-w-lg text-xs text-muted-foreground">{t("providerDescription")}</p>
          <Button asChild size="sm" className="mt-3 h-8 gap-2 text-xs">
            <Link href="/auth/signup">
              {t("becomeProvider")}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 hidden w-[42%] md:block">
          <Image
            src="/slide-4.jpg"
            alt={t("teamPhoto")}
            fill
            sizes="(min-width: 768px) 42vw, 0px"
            className="object-cover object-[center_30%] dark:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
