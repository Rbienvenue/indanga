import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/providers/theme-toggle";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/properties" },
  { label: "About Us", href: "/#about" },
  { label: "How it works", href: "/#how-it-works" },
];

const supportLinks = [
  { label: "Help Center", href: "/dashboard/support" },
  { label: "FAQs", href: "/dashboard/support#faqs" },
  { label: "Email Support", href: "mailto:support@indanga.com" },
  { label: "Call for Support", href: "tel:+250788123456" },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t ">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/50">
              Your all-in-one platform for homes, hotels, and car rentals in Rwanda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact Us</h3>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a
                href="mailto:support@indanga.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="size-4" />
                support@indanga.com
              </a>
              <a
                href="tel:+250788123456"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="size-4" />
                +250 788 123 456
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} INDANGA. All rights reserved.
          </p>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
