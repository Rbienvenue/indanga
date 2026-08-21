"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Building2,
  HeartHandshake,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Home,
  Users2,
  Award,
} from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SocialLink = {
  label: string;
  href: string;
  icon: IconType;
};

type Person = {
  name: string;
  position: string;
  department?: string;
  image: string;
  bio?: string;
  socialLinks: SocialLink[];
};

const defaultSocialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "#", icon: FaLinkedin },
  { label: "X", href: "#", icon: FaXTwitter },
  { label: "Facebook", href: "#", icon: FaFacebook },
  { label: "Instagram", href: "#", icon: FaInstagram },
];

const leadershipMembers: Person[] = [
  {
    name: "RUVEBANA Didier",
    position: "Chief Executive Officer",
    department: "Governance",
    image: "/didier.jpeg",
    bio: `
Didier has a strong foundation in Business Management and Finance and nearly six years of hands-on experience in manufacturing, production, and mining sector , he is a strategic leader driven by a passion for building people, transforming operations, and creating sustainable businesses.

He holds a Bachelor of science with Honors in Finance and is currently pursuing a Master of Science (MSc) in Human Resource Management, combining financial intelligence with a deep understanding of people and organizational development.

Throughout his career, he has gained extensive experience in operations leadership, people management, business strategy, and performance improvement. His approach is built on the belief that successful organizations are created by bringing together the right people, strong systems, innovative ideas, and disciplined execution.

As Co-Founder & CEO, he provides the vision, strategic direction, and leadership needed to turn ideas into impactful solutions. His goal is not simply to build a company, but to build an organization that creates value, empowers people, solves real-world challenges, and contributes to sustainable growth.`,
    socialLinks: defaultSocialLinks,
  },
  {
    name: "Ntakirutimana Gisa Emmanuel",
    position: "Chief Technical Officer",
    department: "Governance",
    image: "/Gisa.jpeg",
    bio: `
Gisa has a strong background in technology and engineering, with over five years of experience in software development, system architecture, and technical leadership. He is dedicated to driving innovation and implementing cutting-edge solutions that enhance operational efficiency and user experience.

His expertise lies in leading technical teams, developing scalable systems, and integrating advanced technologies to support business growth. Gisa is committed to fostering a culture of continuous learning and improvement, ensuring that the organization stays at the forefront of technological advancement.

As Chief Technical Officer, he provides the technical vision and strategic direction needed to transform ideas into robust, reliable solutions. His goal is to build a technology-driven organization that delivers exceptional value to customers and stakeholders.`,
    socialLinks: defaultSocialLinks,
  },
  {
    name: " Gasaro Ruth",
    position: "Marketing Lead",
    department: "Marketing",
    image: "/Ruth.jpeg",
    bio: `
Gasaro holds a Bachelor of Science with Honors in Marketing, with a strong foundation in marketing strategy, brand development, customer engagement, and digital communication.
Gasaro brings a creative, strategic, and customer-focused perspective to the organization, helping shape the brand, communicate its value, and build meaningful connections with customers, partners, and the wider market.

Her approach combines creativity with strategic thinking, focusing on understanding people, identifying opportunities, and turning ideas into compelling brand experiences. She is passionate about building a brand that is trusted, relevant, innovative, and capable of creating lasting impact.

As part of the leadership team, she plays a key role in driving brand visibility, market positioning, customer engagement, and sustainable growth

`,
    socialLinks: defaultSocialLinks,
  },
];

const teamMembers: Person[] = [
  {
    name: "NTAKIRUTIMANA Gisa Emmanuel",
    position: "Chair person of the Board",
    department: "Board",
    image: "/Gisa.jpeg",
    bio: `
  Gisa has a strong background in technology and engineering, with over five years of experience in software development, system architecture, and technical leadership. He is dedicated to driving innovation and implementing cutting-edge solutions that enhance operational efficiency and user experience.

His expertise lies in leading technical teams, developing scalable systems, and integrating advanced technologies to support business growth. Gisa is committed to fostering a culture of continuous learning and improvement, ensuring that the organization stays at the forefront of technological advancement.

As Chairperson of the Board, he provides the strategic vision and direction needed to transform ideas into robust, reliable solutions. His goal is to build a technology-driven organization that delivers exceptional value to customers and stakeholders.`,
    socialLinks: defaultSocialLinks,
  },
  {
    name: "RUVEBANA Didier",
    position: "Board Member",
    department: "Board",
    image: "/didier.jpeg",
    bio:`
Didier has a strong foundation in Business Management and Finance and nearly six years of hands-on experience in manufacturing, production, and mining sector , he is a strategic leader driven by a passion for building people, transforming operations, and creating sustainable businesses.

He holds a Bachelor of science with Honors in Finance and is currently pursuing a Master of Science (MSc) in Human Resource Management, combining financial intelligence with a deep understanding of people and organizational development.

Throughout his career, he has gained extensive experience in operations leadership, people management, business strategy, and performance improvement. His approach is built on the belief that successful organizations are created by bringing together the right people, strong systems, innovative ideas, and disciplined execution.

As Co-Founder & CEO, he provides the vision, strategic direction, and leadership needed to turn ideas into impactful solutions. His goal is not simply to build a company, but to build an organization that creates value, empowers people, solves real-world challenges, and contributes to sustainable growth.`,
    socialLinks: defaultSocialLinks,
  },
];

const stats = [
  {
    value: "5,000+",
    label: "Verified Listings",
    description: "Inspected homes & apartments",
    icon: Home,
  },
  {
    value: "15,000+",
    label: "Happy Renters",
    description: "Tenants matched smoothly",
    icon: Users2,
  },
  {
    value: "30",
    label: "Districts Covered",
    description: "Across all provinces in Rwanda",
    icon: MapPin,
  },
  {
    value: "99.8%",
    label: "Satisfaction Rate",
    description: "Safe & transparent transactions",
    icon: Award,
  },
];

const coreValues = [
  {
    icon: ShieldCheck,
    title: "100% Verified Properties",
    description:
      "We inspect listings and verify property owners to completely eliminate fraud and fake brokers.",
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Sparkles,
    title: "Transparent & Seamless",
    description:
      "Direct communication, clear rental terms, and straightforward digital agreements without hidden fees.",
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Building2,
    title: "Landlord Empowerment",
    description:
      "Comprehensive digital tools for property owners to reach qualified tenants, manage bookings, and track rent.",
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: HeartHandshake,
    title: "Local 24/7 Support",
    description:
      "A dedicated Rwanda-based support team ready to assist you before, during, and after your tenancy.",
    accent: "text-purple-500 bg-purple-500/10",
  },
];

function PersonCard({ person }: { person: Person }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <article
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={person.image}
              alt={`${person.name}, ${person.position}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {person.department && (
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md">
                  {person.department}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-1 flex-col justify-between">
            <div>
              <h4 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {person.name}
              </h4>
              <p className="mt-1 text-xs font-medium text-primary sm:text-sm">
                {person.position}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-border/50 pt-3">
              {person.socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`${person.name} on ${label}`}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex size-7.5 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>
        </article>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <div className="grid gap-0 md:grid-cols-[minmax(17rem,0.9fr)_1.1fr]">
          <div className="relative min-h-72 bg-muted md:min-h-[30rem]">
            <Image
              src={person.image}
              alt={`${person.name}, ${person.position}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="space-y-4 p-6 sm:p-8">
            <div>
              <DialogTitle className="text-2xl font-bold sm:text-3xl">{person.name}</DialogTitle>
              <p className="mt-2 text-sm font-medium text-primary">{person.position}</p>
            </div>
            <DialogDescription className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {person.bio?.trim() || "Biography coming soon."}
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-muted/20 py-20 sm:py-28 lg:py-32">
      {/* Decorative Glows */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-0 translate-x-1/3">
        <div className="h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 border-primary/30 bg-primary/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary"
          >
            <Sparkles className="size-3.5" />
            About INDANGA
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Transforming Housing & Living in Rwanda
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            INDANGA is Rwanda&apos;s leading digital property ecosystem. We connect tenants, travelers,
            and landlords directly through verified listings, eliminating middleman scams and
            bringing seamless digital contracts and payments to real estate.
          </p>
        </div>

        {/* Bento / Story Split Grid */}
        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Image Showcase with Floating Overlays */}
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-2xl">
              <Image
                src="/hero.jpg"
                alt="Modern housing in Kigali, Rwanda"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top pill badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
                <MapPin className="size-3.5 text-primary" />
                <span>Active Across Rwanda</span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/15 bg-black/70 p-4 text-white backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Zero Broker Fraud</h4>
                    <p className="text-xs text-white/80">
                      Direct verification of land titles & landlord ownership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 4 Core Pillars */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <div
                      className={`inline-flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${value.accent}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-16 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-sm sm:p-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center text-center">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {stat.label}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leadership & Team Section */}
        <div className="mt-24">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
                Our Leadership
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Board & Executive Team
              </h3>
            </div>
            <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
              Guiding INDANGA with decades of combined experience in African real estate,
              technology, and digital infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {teamMembers.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>

        </div>

        {/* Core Operations Team */}
        <div className="mt-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
              The Engine Behind INDANGA
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Operations & Engineering
            </h3>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadershipMembers.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>
        </div>

        {/* Landlord Partner CTA Banner */}
        <div className="mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 sm:p-12">
          <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Building2 className="size-4" /> For Property Owners & Landlords
              </span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                List Your House or Apartment on INDANGA
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reach thousands of verified tenants across Rwanda, automate rent payments, and
                eliminate vacancy periods effortlessly.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2 font-semibold shadow-md" asChild>
                <Link href="/dashboard/properties/new">
                  List a Property <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold" asChild>
                <Link href="/properties">Browse Listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
