"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/components/providers/session-provider";
import { signOut } from "@/lib/auth-client";
import { UserAvatar } from "@/components/user/user-avatar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/properties" },
  { label: "About Us", href: "/about" },
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
  const router = useRouter();
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
          <span className="text-xl font-bold tracking-tight text-white">INDANGA</span>
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

        {/* Mobile Menu */}
        <div className="md:hidden">
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
                <div className="flex flex-col gap-2 border-t border-primary/30 p-5">
                  {session ? (
                    <>
                      <Button asChild size="lg" variant="outline" className="w-full font-semibold">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-accent text-accent font-semibold hover:bg-accent hover:text-accent-foreground"
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          await signOut({
                            fetchOptions: {
                              onSuccess: () => router.push("/"),
                            },
                          });
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full font-semibold cursor-pointer"
                      >
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="default"
                        className="w-full font-semibold cursor-pointer"
                      >
                        <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </>
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
