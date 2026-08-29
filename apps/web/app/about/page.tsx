import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home, Building2, Car, Mail, Phone, MapPin, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar solid />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Content */}
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  About INDANGA
                </div>
                
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Making it easier to find the right place.
                </h1>
                
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  INDANGA is a technology-driven platform that simplifies how people discover, compare, and access properties and services. We connect customers with property owners, landlords, hotels, and mobility providers through a modern digital experience.
                </p>
                
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/properties">
                    <Button size="lg" className="w-full sm:w-auto">
                      Explore Properties
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                  <Link href="#contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Visual */}
              <div className="relative h-96 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-small-black/[0.03] dark:bg-grid-small-white/[0.03]" />
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-accent/20">
                    <Building2 className="size-10 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">Premium Property Platform</p>
                  <p className="mt-2 text-sm text-muted-foreground">Connecting Rwanda through technology</p>
                </div>
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
                  01 — Who We Are
                </div>
                <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                  A simpler way to discover and access places.
                </h2>
              </div>
              
              {/* Right Content */}
              <div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  INDANGA is a technology-enabled platform designed to simplify the way people discover, compare, and access properties and related services.
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
                    01 / Our Mission
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    Mission
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    To revolutionize property discovery and access in Rwanda by providing a seamless, trustworthy digital platform that connects people with properties, accommodation, and mobility services.
                  </p>
                </div>
              </div>
              
              {/* Vision */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted p-0 transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative p-8 sm:p-12">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
                    02 / Our Vision
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                    Vision
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    To be Rwanda's most trusted platform for property and service discovery, empowering individuals and businesses to make informed decisions and achieve their goals.
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
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg">
                <div className="mb-6 inline-flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                  <Home className="size-8 text-primary" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-foreground">Properties</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Discover houses and properties based on location, price, property type, availability, and other criteria tailored to your needs.
                </p>
              </div>
              
              {/* Hotels & Accommodation */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/40 hover:shadow-lg">
                <div className="mb-6 inline-flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-accent/10 transition-transform group-hover:scale-110">
                  <Building2 className="size-8 text-accent" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-foreground">Hotels & Accommodation</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Discover and book suitable accommodation for travel, business, family gatherings, and other occasions throughout Rwanda.
                </p>
              </div>
              
              {/* Cars & Mobility */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="mb-6 inline-flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                  <Car className="size-8 text-primary" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-foreground">Cars & Mobility</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Access vehicle and mobility booking services conveniently through our integrated platform for all your transportation needs.
                </p>
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
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-primary/20 to-accent/20 sm:h-72">
                  <div className="flex items-center justify-center w-full h-full">
                    <Users className="size-16 text-primary/40" />
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    Chief Executive
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    CEO
                  </h3>
                  <p className="mb-4 leading-relaxed text-sm text-muted-foreground">
                    Leading INDANGA's vision and strategic direction. Building a platform that transforms how Rwanda accesses properties and services.
                  </p>
                </div>
              </div>
              
              {/* CTO */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-accent/20 to-primary/20 sm:h-72">
                  <div className="flex items-center justify-center w-full h-full">
                    <Zap className="size-16 text-accent/40" />
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                    Chief Technology
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    CTO
                  </h3>
                  <p className="mb-4 leading-relaxed text-sm text-muted-foreground">
                    Architecting the technical foundation of INDANGA. Ensuring a scalable, secure, and intuitive platform for millions of users.
                  </p>
                </div>
              </div>
              
              {/* Marketing Lead */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-xl sm:col-span-2 lg:col-span-1">
                <div className="relative h-64 overflow-hidden bg-linear-to-br from-primary/20 to-accent/20 sm:h-72">
                  <div className="flex items-center justify-center w-full h-full">
                    <Users className="size-16 text-primary/40" />
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    Marketing & Growth
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    Marketing Lead
                  </h3>
                  <p className="mb-4 leading-relaxed text-sm text-muted-foreground">
                    Driving INDANGA's market presence and user acquisition. Connecting with communities across Rwanda and beyond.
                  </p>
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
                  <div className="flex items-center justify-center w-full h-full">
                    <Shield className="size-20 text-primary/30" />
                  </div>
                </div>
                
                <div className="p-8 sm:p-10">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                    Board Leadership
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-foreground">
                    Chairperson
                  </h3>
                  <p className="mb-2 leading-relaxed text-muted-foreground">
                    Providing visionary leadership and strategic direction. Ensuring INDANGA's mission is fulfilled with integrity and excellence.
                  </p>
                </div>
              </div>
              
              {/* Board Member */}
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted transition-all hover:border-accent/40 hover:shadow-xl">
                <div className="relative h-80 overflow-hidden bg-linear-to-br from-accent/20 to-transparent">
                  <div className="flex items-center justify-center w-full h-full">
                    <Users className="size-20 text-accent/30" />
                  </div>
                </div>
                
                <div className="p-8 sm:p-10">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                    Board Member
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-foreground">
                    Board Member
                  </h3>
                  <p className="mb-2 leading-relaxed text-muted-foreground">
                    Contributing expertise and oversight across key areas. Supporting INDANGA's growth, sustainability, and market leadership.
                  </p>
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
              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="size-6 text-accent" />
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
            <div className="rounded-2xl border border-border bg-linear-to-br from-primary/5 to-accent/5 p-12 sm:p-16 text-center">
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
                    <div className="mb-3 inline-flex size-12 items-center justify-center rounded-lg bg-accent/10">
                      <Mail className="size-6 text-accent" />
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