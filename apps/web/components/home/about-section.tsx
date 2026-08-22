"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { Badge } from "@/components/ui/badge";
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
    name: "NTAKIYIRUTA Didier",
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
Ntakirutimana Gisa Emmanuel is a Rwandan physicist, researcher, innovator, and multidisciplinary professional specializing in Material Science and Engineering, renewable energy, research and development, and practical technological solutions.

He Co-founded and serves as Research Director at Brilliant Researchers Africa (BRA), where he contributes to research, prototype development, and innovative solutions addressing challenges in sustainability, energy, safety, and urban development. 

He previously served as General Manager at MANRON GROUP LTD and later after serving as an Operations Manager at SHDR LTD !

His professional work includes research and development of practical innovations in areas such as biochar technology, fire-safety solutions, renewable energy, and other research-driven projects. He is particularly focused on translating scientific knowledge and research into practical, scalable solutions that respond to real challenges in Rwanda and across Africa.

His long-term vision is to contribute to Africa's development through scientific research, innovation, entrepreneurship, and practical solutions while empowering the next generation through knowledge, skills, and applied research.`,
    socialLinks: defaultSocialLinks,
  },
  {
    name: "Gasaro Ruth",
    position: "Marketing Lead",
    department: "Marketing",
    image: "/Ruth.jpeg",
    bio: `
Gasaro holds a Bachelor of Science with Honors in Marketing, with a strong foundation in marketing strategy, brand development, customer engagement, and digital communication.
Gasaro brings a creative, strategic, and customer-focused perspective to the organization, helping shape the brand, communicate its value, and build meaningful connections with customers, partners, and the wider market.

Her approach combines creativity with strategic thinking, focusing on understanding people, identifying opportunities, and turning ideas into compelling brand experiences. She is passionate about building a brand that is trusted, relevant, innovative, and capable of creating lasting impact.

As part of the leadership team, she plays a key role in driving brand visibility, market positioning, customer engagement, and sustainable growth.`,
    socialLinks: defaultSocialLinks,
  },
];

const boardMembers: Person[] = [
  {
    name: "NTAKIRUTIMANA Gisa Emmanuel",
    position: "Chairperson of the Board",
    department: "Board",
    image: "/Gisa.jpeg",
    bio: `
Ntakirutimana Gisa Emmanuel is a Rwandan physicist, researcher, innovator, and multidisciplinary professional specializing in Material Science and Engineering, renewable energy, research and development, and practical technological solutions.

He Co-founded and serves as Research Director at Brilliant Researchers Africa (BRA), where he contributes to research, prototype development, and innovative solutions addressing challenges in sustainability, energy, safety, and urban development. 

He previously served as General Manager at MANRON GROUP LTD and later after serving as an Operations Manager at SHDR LTD !

His professional work includes research and development of practical innovations in areas such as biochar technology, fire-safety solutions, renewable energy, and other research-driven projects. He is particularly focused on translating scientific knowledge and research into practical, scalable solutions that respond to real challenges in Rwanda and across Africa.

His long-term vision is to contribute to Africa's development through scientific research, innovation, entrepreneurship, and practical solutions while empowering the next generation through knowledge, skills, and applied research.`,
    socialLinks: defaultSocialLinks,
  },
  {
    name: "NTAKIYIRUTA Didier",
    position: "Board Member",
    department: "Board",
    image: "/didier.jpeg",
    bio: `
Didier has a strong foundation in Business Management and Finance and nearly six years of hands-on experience in manufacturing, production, and mining sector , he is a strategic leader driven by a passion for building people, transforming operations, and creating sustainable businesses.

He holds a Bachelor of science with Honors in Finance and is currently pursuing a Master of Science (MSc) in Human Resource Management, combining financial intelligence with a deep understanding of people and organizational development.

Throughout his career, he has gained extensive experience in operations leadership, people management, business strategy, and performance improvement. His approach is built on the belief that successful organizations are created by bringing together the right people, strong systems, innovative ideas, and disciplined execution.

As Co-Founder & CEO, he provides the vision, strategic direction, and leadership needed to turn ideas into impactful solutions. His goal is not simply to build a company, but to build an organization that creates value, empowers people, solves real-world challenges, and contributes to sustainable growth.`,
    socialLinks: defaultSocialLinks,
  },
];

const sectionLinks = [
  { id: "overview", label: "Overview" },
  { id: "organization-structure", label: "Organization Structure" },
  { id: "senior-management", label: "Senior Management" },
  { id: "board-of-directors", label: "Board of Directors" },
] as const;

const overviewStory = [
  "About Indanga — Our Origin",
  "Indanga was established from a simple observation: many of the resources people need already exist, but finding and accessing them efficiently remains a challenge.",
  "The idea emerged from observing the everyday difficulties people face when searching for homes, apartments, cars, professional services, skilled workers, spaces, and other economic resources.",
  "Much of this information is scattered across WhatsApp groups, social media, personal networks, brokers, advertisements, and physical locations. This fragmentation often forces people to make numerous calls, travel from place to place, rely on intermediaries, and spend valuable time searching for something that may already be available nearby.",
  "At the same time, individuals and businesses often have underutilized assets, skills, services, and opportunities that are difficult to make visible to the people who need them.",
  "This creates an important economic gap: resources are available, demand exists, but the two sides are not always efficiently connected.",
  "Indanga was therefore conceived as a digital connectivity and discovery platform designed to bridge this gap.",
  "Its purpose is to bring available resources and potential users closer together through a more organized, accessible, and efficient digital environment.",
  "From its foundation, the concept of Indanga has been built around reducing search time, unnecessary movement, information gaps, and transaction friction, while improving the visibility and utilization of existing resources.",
  "Whether a person is searching for a home, apartment, vehicle, service provider, skilled professional, or another opportunity, Indanga seeks to simplify the journey from “I need it” to “I found it.”",
  "The vision behind Indanga goes beyond creating another listing or advertising platform.",
  "It is to develop an interconnected economic ecosystem where people, assets, services, skills, and opportunities can be discovered and connected more efficiently.",
  "Indanga was established with the belief that economic efficiency does not always require creating more resources—it can begin by making the resources that already exist easier to find, access, and utilize.",
];

const institutionalValues = [
  {
    icon: ShieldCheck,
    title: "Trust and verification",
    description: "We create a more credible marketplace by emphasizing visibility, accountability, and reliable discovery.",
  },
  {
    icon: Building2,
    title: "Economic connectivity",
    description: "Indanga connects supply and demand so people can find what they need faster and with less friction.",
  },
  {
    icon: HeartHandshake,
    title: "Accessible opportunity",
    description: "We help individuals, businesses, and communities turn unused assets and services into practical value.",
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
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:p-4"
        >
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={person.image}
              alt={`${person.name}, ${person.position}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {person.department && (
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
                  {person.department}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-1 flex-col justify-between">
            <div>
              <h4 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {person.name}
              </h4>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-primary">{person.position}</p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3">
              {person.socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`${person.name} on ${label}`}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="size-3" />
                </a>
              ))}
            </div>
          </div>
        </article>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <div className="grid gap-0 md:grid-cols-[minmax(17rem,0.9fr)_1.1fr]">
          <div className="relative min-h-72 bg-muted md:min-h-120">
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
  const [activeSection, setActiveSection] = useState<string>(sectionLinks[0].id);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <section id="overview" className="scroll-mt-28 pt-6 sm:pt-8">
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Overview</p>
            </div>

            <div className="mt-5 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-5 lg:p-6">
              <p className="text-sm font-semibold text-foreground sm:text-base">
                About Indanga — Our Origin
              </p>

              <div className="mt-4 max-w-4xl space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                {overviewStory.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        );
      case "organization-structure":
        return (
          <section id="organization-structure" className="scroll-mt-28 pt-6 sm:pt-8">
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Organization Structure</p>
            </div>

            <div className="mt-5 rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-4 lg:p-5">
              <div className="overflow-x-auto">
                <div className="mx-auto max-w-5xl">
                  <Image
                    src="/structure.png"
                    alt="Indanga organizational overview"
                    width={1600}
                    height={900}
                    className="h-auto max-h-[42svh] w-full rounded-xl border border-border/70 object-contain object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>
        );
      case "senior-management":
        return (
          <section id="senior-management" className="scroll-mt-28 pt-6 sm:pt-8">
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Senior Management</p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {leadershipMembers.map((person) => (
                <PersonCard key={`${person.name}-${person.position}`} person={person} />
              ))}
            </div>
          </section>
        );
      case "board-of-directors":
        return (
          <section id="board-of-directors" className="scroll-mt-28 pt-6 sm:pt-8">
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Board of Directors</p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {boardMembers.map((person) => (
                <PersonCard key={`${person.name}-${person.position}`} person={person} />
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <section id="about" className="relative overflow-hidden border-t border-primary/40 bg-background py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl lg:mb-10">
          <Badge
            variant="outline"
            className="mb-3 gap-2 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase"
          >
            <Sparkles className="size-3" />
            About Indanga
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About Indanga
          </h1>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label="About section navigation"
            className="lg:flex lg:h-[calc(100svh-12rem)] lg:items-center"
          >
            <ul className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {sectionLinks.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(id)}
                    aria-pressed={activeSection === id}
                    className={`flex min-h-14 w-full items-center justify-between border border-border/70 bg-card px-4 text-left text-sm font-semibold shadow-sm transition-all ${
                      activeSection === id
                        ? "border-primary/30 text-primary shadow-md ring-1 ring-primary/10"
                        : "text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    <ChevronRight
                      className={`size-4 shrink-0 transition-transform ${
                        activeSection === id ? "translate-x-0.5" : ""
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0">
            {renderActiveSection()}

            {activeSection === "overview" && (
              <section className="mt-6 grid gap-3 sm:grid-cols-3">
                {institutionalValues.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
                    <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
                  </div>
                ))}
              </section>
            )}

            {activeSection === "overview" && (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                Building a more connected, accessible, and trustworthy digital economy.
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
