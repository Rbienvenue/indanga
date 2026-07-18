import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

const benefits = ["Verified property listings", "Simple, secure bookings", "Homes across Rwanda"];

export function AuthShell({ children, eyebrow, title, description }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f5ef] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(32rem,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#090a2d] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Image
          src="/hero.jpg"
          alt="Kigali skyline and homes"
          fill
          priority
          sizes="55vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#090a2d]/95 via-[#090a2d]/70 to-[#090a2d]/30" />

        <Link
          href="/"
          className="relative z-10 w-fit text-xl font-bold tracking-[0.16em] text-white transition-colors hover:text-primary"
        >
          INDANGA
        </Link>

        <div className="relative z-10 max-w-xl text-white">
          <p className="mb-5 text-sm font-semibold tracking-[0.22em] text-primary uppercase">
            Find your place
          </p>
          <h2 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance xl:text-6xl">
            A simpler way to find a space that feels like yours.
          </h2>
          <ul className="mt-9 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs tracking-wide text-white/45">
          Homes, hotels, and more — all in one place.
        </p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
          <Link href="/" className="font-bold tracking-[0.14em] text-[#090a2d] lg:hidden">
            INDANGA
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#8a6300] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#090a2d] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
