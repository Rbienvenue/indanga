import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";

const exploreLinks = [
  { label: "Homes", href: "/properties?type=homes" },
  { label: "Hotels", href: "/properties?type=hotels" },
  { label: "Cars", href: "/properties?type=cars" },
];


const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/about#contact" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Terms of use", href: "/terms-and-conditions" },
];

const trustLinks = [
  { label: "Help Center", href: "/support" },
  { label: "Safety and verification", href: "/support#safety" },
  { label: "Prices and fees", href: "/support#prices" },
  { label: "Cancellation and refunds", href: "/refund-cancellation-policy" },
];

const socialLinks = [
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "X", icon: FaXTwitter },
  { label: "LinkedIn", icon: FaLinkedinIn },
  { label: "YouTube", icon: FaYoutube },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-muted/60">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-[1.35fr_0.65fr_1.2fr_0.75fr_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="INDANGA"
                width={36}
                height={36}
                className="size-9 rounded-lg object-contain bg-white shadow-xs"
              />
              <span className="text-xl font-bold text-primary">INDANGA</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Homes. Hotels. Cars. Rwanda.
            </p>
            <nav aria-label="Social media" className="mt-3 flex items-center gap-3">
              {socialLinks.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold">Explore</h3>
            <ul className="flex flex-col gap-1.5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold">Trust and support</h3>
            <ul className="flex flex-col gap-1.5">
              {trustLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold">Company</h3>
            <ul className="flex flex-col gap-1.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold">Contact</h3>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <a
                href="mailto:support@indanga.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                support@indanga.com
              </a>
              <span className="text-[11px]">Customer support</span>
              <a
                href="mailto:info@indanga.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                info@indanga.com
              </a>
              <span className="text-[11px]">General enquiries</span>
              <a
                href="tel:+250788765547"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                +250 788 765 547
              </a>
              <span className="text-[11px]">
                Mon&ndash;Sat, 8:00 AM&ndash;6:00 PM &middot; Usually replies within 24 hours
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                Kigali, Rwanda
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col justify-between gap-1 text-[10px] text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} INDANGA. All rights reserved.</p>
          <p>Building a more connected Rwanda.</p>
        </div>
      </div>
    </footer>
  );
}
