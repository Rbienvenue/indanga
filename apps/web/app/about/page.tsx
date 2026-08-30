"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaEnvelope, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { ArrowRight, Home, Building2, Car, Mail, Phone, MapPin, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";

const slides = [
  { id: 1, image: "/slide-1.jpg" },
  { id: 2, image: "/slide-2.jpg" },
  { id: 3, image: "/slide-3.jpg" },
  { id: 4, image: "/slide-4.jpg" },
];

export default function About() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar solid />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden pt-0 pb-0">
          <div className="relative mx-auto max-w-[1600px]">
            <div className="relative h-[620px] overflow-hidden md:h-[700px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeSlide === index ? "opacity-100" : "opacity-0"
                    }`}
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}

              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />

              <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl text-white">
                  <div className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                    About INDANGA
                  </div>

                  <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl md:text-7xl">
                    Making it easier to
                    <span className="block">find the right place.</span>
                  </h1>

                  <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg md:text-[1.35rem]">
                    Indanga was established from a simple observation: many of the resources people need already exist, but finding and accessing them efficiently remains a challenge. The platform was built to connect people with homes, apartments, cars, services, skills, and opportunities that are often scattered across fragmented channels and hard to discover.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/properties">
                      <Button size="lg" className="w-full bg-[#0a7bd7] text-white hover:bg-[#0869b8] sm:w-auto">
                        Explore Properties
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                    <Link href="#contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-white/40 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Who We Are Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
              {/* Left Content */}
              <div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
                  Who We Are
                </div>
                <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                  A simpler way to discover and access places.
                </h2>
              </div>

              {/* Right Content */}
              <div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Indanga was established from a simple observation: many of the resources people need already exist, but finding and accessing them efficiently remains a challenge. The platform was built to connect people with homes, apartments, cars, services, skills, and opportunities that are often scattered across fragmented channels and hard to discover.
                </p>

                <div className="mt-12 grid gap-8 sm:grid-cols-2">
                  {[
                    { label: "DISCOVER", desc: "Find properties matching your needs" },
                    { label: "COMPARE", desc: "Review and compare options easily" },
                    { label: "BOOK", desc: "Secure your booking instantly" },
                    { label: "CONNECT", desc: "Link with service providers" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg">
                      <div className="text-2xl font-bold text-primary">{item.label}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Mission & Vision Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Our Purpose
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
              {/* Mission */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted p-0 transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative p-8 sm:p-12">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
                    Our Mission
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    Mission
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    To reduce search time, unnecessary movement, and information gaps by creating a more organized and accessible digital environment where people can discover and connect with the resources, services, and opportunities that already exist around them.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted p-0 transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative p-8 sm:p-12">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
                    Our Vision
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    Vision
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    To become the leading digital ecosystem for discovery and connection, where people, assets, services, skills, and opportunities are easier to find, access, and utilize—turning fragmented information into a more efficient and connected economy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* What We Do Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Everything you need, connected in one platform.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover our comprehensive ecosystem of services
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Properties */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/slide-1.jpg"
                    alt="Properties"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                </div>

                <div className="p-8">
                  <h3 className="mb-3 text-xl font-bold text-foreground">Properties</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Discover houses and properties based on location, price, property type, availability, and other criteria tailored to your needs.
                  </p>
                </div>
              </div>

              {/* Hotels & Accommodation */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/slide-2.jpg"
                    alt="Hotels & Accommodation"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                </div>

                <div className="p-8">
                  <h3 className="mb-3 text-xl font-bold text-foreground">Hotels & Accommodation</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Discover and book suitable accommodation for travel, business, family gatherings, and other occasions throughout Rwanda.
                  </p>
                </div>
              </div>

              {/* Cars & Mobility */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/car2.jpg"
                    alt="Cars & Mobility"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                </div>

                <div className="p-8">
                  <h3 className="mb-3 text-xl font-bold text-foreground">Cars & Mobility</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Access vehicle and mobility booking services conveniently through our integrated platform for all your transportation needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Senior Management Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Leadership
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Meet the people driving INDANGA forward.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* CEO */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-primary/20 to-primary/20 sm:h-72">
                  <Image
                    src="/Didier.png"
                    alt="CEO"
                    width={400}
                    height={400}
                    className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    CEO
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    NTAKIYIRUTA Didier
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { href: "mailto:didier@indanga.rw", label: "Email", icon: FaEnvelope },
                      { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedinIn },
                      { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
                    ].map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTO */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-primary/20 to-primary/20 sm:h-72">
                  <Image
                    src="/Gisa.png"
                    alt="CTO"
                    width={400}
                    height={400}
                    className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    CTO
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    NTAKIRUTIMANA Gisa Emmanuel
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { href: "mailto:gisa@indanga.rw", label: "Email", icon: FaEnvelope },
                      { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedinIn },
                      { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
                    ].map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Marketing Lead */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-xl sm:col-span-2 lg:col-span-1">
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-primary/20 to-primary/20 sm:h-72">
                  <Image
                    src="/Ruth.png"
                    alt="Marketing Lead"
                    width={400}
                    height={400}
                    className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    Marketing Lead
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    GASARO Ruth
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { href: "mailto:ruth@indanga.rw", label: "Email", icon: FaEnvelope },
                      { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedinIn },
                      { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
                    ].map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Board of Directors Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Board of Directors
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Providing strategic guidance, oversight, and accountability.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
              {/* Chairperson */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="relative h-80 overflow-hidden bg-linear-to-br from-primary/20 to-transparent">
                  <Image
                    src="/Gisa.png"
                    alt="Chairperson"
                    width={400}
                    height={400}
                    className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="p-8 sm:p-10">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                    Chairperson
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-foreground">
                    NTAKIRUTIMANA Gisa Emmanuel
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { href: "mailto:gisa@indanga.rw", label: "Email", icon: FaEnvelope },
                      { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedinIn },
                      { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
                    ].map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Board Member */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="relative h-80 overflow-hidden bg-linear-to-br from-primary/20 to-transparent">
                  <Image
                    src="/Didier.png"
                    alt="Board Member"
                    width={400}
                    height={400}
                    className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="p-8 sm:p-10">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                    Board Member
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-foreground">
                    NTAKIYIRUTA Didier
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { href: "mailto:didier@indanga.rw", label: "Email", icon: FaEnvelope },
                      { href: "https://linkedin.com", label: "LinkedIn", icon: FaLinkedinIn },
                      { href: "https://instagram.com", label: "Instagram", icon: FaInstagram },
                    ].map(({ href, label, icon: Icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Why INDANGA Section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Why INDANGA?
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Convenience */}
              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Convenience</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Discover and manage services from one platform.
                </p>
              </div>

              {/* Connected Experience */}
              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Connected Experience</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Connect customers with property and service providers.
                </p>
              </div>

              {/* Transparency */}
              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Transparency</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Clear information to help you make informed decisions.
                </p>
              </div>

              {/* Digital Convenience */}
              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">Digital Convenience</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Discovery, booking, and payment made easier through technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Contact Section */}
        <section id="contact" className="py-20 sm:py-28">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-linear-to-br from-primary/5 to-primary/5 p-12 sm:p-16 text-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Let's connect.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Have a question, partnership idea, or need assistance? We'd love to hear from you.
              </p>

              <div className="mt-12 space-y-6">
                {/* Contact Details */}
                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Location */}
                  <div className="flex flex-col items-center">
                    <div className="mb-3 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Location</p>
                      <p className="mt-1 text-sm text-muted-foreground">Kigali, Rwanda</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col items-center">
                    <div className="mb-3 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Email</p>
                      <Link href="mailto:info@indanga.com" className="mt-1 text-sm text-primary hover:text-primary/80">
                        info@indanga.com
                      </Link>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col items-center">
                    <div className="mb-3 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Phone</p>
                      <Link href="tel:+250788123456" className="mt-1 text-sm text-primary hover:text-primary/80">
                        +250 788 123 456
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-8 border-t border-border">
                  <Link href="mailto:info@indanga.com">
                    <Button size="lg">
                      Get in Touch
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}