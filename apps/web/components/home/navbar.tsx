"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/components/providers/session-provider";
import { UserAvatar } from "@/components/user/user-avatar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/properties" },
];

const aboutLinks = [
  { label: "About Us", href: "/about" },
  { label: "What We Do", href: "/about#what-we-do" },
  { label: "Team", href: "/about#leadership" },
  { label: "Contact", href: "/about#contact" },
];

const socialLinks = [
  { label: "LinkedIn", href: "#", icon: FaLinkedin },
  { label: "X", href: "#", icon: FaXTwitter },
  { label: "Facebook", href: "#", icon: FaFacebook },
  { label: "Instagram", href: "#", icon: FaInstagram },
];

export function Navbar({ solid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = React.useState(solid);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeHash, setActiveHash] = React.useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useSession();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/" && !activeHash && !searchParams.get("about");
    if (href === "/#about") return pathname === "/" && (activeHash === "#about" || searchParams.has("about"));
    if (href.startsWith("/#")) return pathname === "/" && activeHash === href.slice(1);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeAboutMenu = () => setAboutOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${scrolled || solid
        ? "bg-[#0A0A2C]/95 shadow-lg shadow-black/20 backdrop-blur-xl"
        : "bg-transparent"
        }`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="INDANGA"
            width={36}
            height={36}
            className="size-9 rounded-lg object-contain bg-white shadow-xs"
            priority
          />
          <span className="hidden text-xl font-bold tracking-tight text-white md:inline">INDANGA</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`border-b-2 px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:border-accent hover:text-accent ${isActiveLink(link.href) ? "border-accent text-accent" : "border-transparent"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                type="button"
                aria-expanded={aboutOpen}
                onClick={() => setAboutOpen((open) => !open)}
                className={`flex items-center gap-1 border-b-2 px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:border-accent hover:text-accent ${pathname === "/about" ? "border-accent text-accent" : "border-transparent"}`}
              >
                About Us
                <ChevronDown className={`size-4 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
              </button>

              {aboutOpen && (
                <div className="absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 rounded-lg border border-primary/30 bg-[#0A0A2C] p-2 shadow-xl">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeAboutMenu}
                      className="block rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-[#101044] hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA - Show avatar if authenticated, otherwise show auth links */}
          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <UserAvatar />
            ) : (
              <>
                <Button size="lg" variant="outline" className="px-6 font-semibold" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button size="lg" variant="default" className="px-6 font-semibold" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Auth and Menu */}
        <div className="flex items-center gap-1.5 md:hidden">
          {session ? (
            <UserAvatar />
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="px-2 text-white hover:text-accent">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm" variant="default" className="px-2.5">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-primary">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="h-svh w-full max-w-none gap-0 overflow-y-auto border-primary/30 bg-[#0A0A2C] p-0 text-white"
            >
              <SheetTitle className="flex min-h-20 items-center justify-between border-b border-primary/40 px-5 pr-16 text-primary">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <Image
                    src="/logo.png"
                    alt="INDANGA"
                    width={32}
                    height={32}
                    className="size-8 rounded-md object-contain bg-white shadow-xs"
                  />
                  <span className="text-lg font-bold text-white">INDANGA</span>
                </Link>
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              </SheetTitle>
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-20 w-full items-center justify-center border-b-2 px-5 text-base font-semibold text-white/85 transition-colors hover:border-accent hover:bg-[#101044] hover:text-accent ${isActiveLink(link.href) ? "border-accent text-accent" : "border-primary/30"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-b-2 border-primary/30">
                  <button
                    type="button"
                    aria-expanded={aboutOpen}
                    onClick={() => setAboutOpen((open) => !open)}
                    className={`flex min-h-20 w-full items-center justify-center gap-2 px-5 text-base font-semibold text-white/85 transition-colors hover:bg-[#101044] hover:text-accent ${pathname === "/about" ? "text-accent" : ""}`}
                  >
                    About Us
                    <ChevronDown className={`size-5 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
                  </button>

                  {aboutOpen && (
                    <div className="border-t border-primary/30 bg-[#101044] px-5 py-2">
                      {aboutLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => {
                            closeAboutMenu();
                            setMobileMenuOpen(false);
                          }}
                          className="block border-b border-white/10 px-3 py-3 text-center text-sm text-white/80 last:border-b-0 hover:text-accent"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
