import Link from "next/link";
import { Separator } from "@/components/ui/separator";
// import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "Explore", href: "#explore" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const supportLinks = [
  { label: "Help Center", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "FAQs", href: "#" },
];

// const socialLinks = [
//   { icon: Facebook, href: "#", label: "Facebook" },
//   { icon: Twitter, href: "#", label: "Twitter" },
//   { icon: Instagram, href: "#", label: "Instagram" },
//   { icon: Youtube, href: "#", label: "YouTube" },
// ];

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-xl font-bold text-primary">INDANGA</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/50">
              Your all-in-one platform for homes, hotels, and car rentals in Rwanda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-background">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/50 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-background">Support</h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/50 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-background">Follow Us</h3>
            <div className="flex items-center gap-3">
              {/*{socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="size-4" />
                </Link>
              ))}*/}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} INDANGA. All rights reserved.
          </p>
          <p className="text-xs text-background/40">
            Made with <span className="text-red-400">❤</span> in Rwanda
          </p>
        </div>
      </div>
    </footer>
  );
}
