import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CircleHelp,
  Clock3,
  CreditCard,
  House,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const supportAreas = [
  {
    icon: House,
    title: "Booking & stay help",
    description:
      "Need help with a reservation, property access, or arranging your next stay?",
    items: [
      "Check reservation details and check-in instructions",
      "Update guest or stay details",
      "Report missing amenities or property issues",
    ],
  },
  {
    icon: Building2,
    title: "Property & listing support",
    description:
      "For hosts and guests who need help with listing visibility, verification, or quality checks.",
    items: [
      "Review listing accuracy and images",
      "Resolve ownership or verification concerns",
      "Request assistance with house or hotel quality issues",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & refunds",
    description:
      "Questions about pricing, payment confirmations, refunds, or invoice requests.",
    items: [
      "Confirm payment status or receipt details",
      "Request refund information or billing support",
      "Understand cancellation and service fee policies",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety & trust",
    description:
      "We help protect users, landlords, and tenants with secure, verified booking experiences.",
    items: [
      "Report suspicious activity or unsafe situations",
      "Request account verification support",
      "Learn how we review listings and payments",
    ],
  },
] as const;

const contactChannels = [
  {
    icon: Mail,
    title: "Email support",
    value: "support@indanga.com",
    href: "mailto:support@indanga.com",
    description: "Usually replies within 24 hours.",
  },
  {
    icon: Phone,
    title: "Call us",
    value: "+250 788 123 456",
    href: "tel:+250788123456",
    description: "Available Monday to Saturday, 8:00 AM - 6:00 PM.",
  },
  {
    icon: MessageSquareText,
    title: "Live chat",
    value: "Chat with the team",
    href: "mailto:support@indanga.com?subject=Live%20chat%20request",
    description: "For urgent booking or payment questions.",
  },
] as const;

const faqItems = [
  {
    question: "How do I book a property on Indanga?",
    answer:
      "Browse homes, hotels, or cars, choose a suitable option, and complete the booking with a secure payment flow. You will receive confirmation by email once the reservation is confirmed.",
  },
  {
    question: "Can I cancel or modify my reservation?",
    answer:
      "Cancellation and modification rules depend on the host or property owner. You can review the specific policy in the listing before payment and contact support if you need help with a change.",
  },
  {
    question: "What if I experience a problem during my stay?",
    answer:
      "Please contact our support team immediately with your booking reference and a description of the issue. We help coordinate with the host or provider to resolve matters quickly.",
  },
  {
    question: "How are payments protected?",
    answer:
      "Indanga follows secure payment flows and account verification checks to help keep transactions safe. If you see anything suspicious, contact support right away.",
  },
  {
    question: "What support do landlords and agents receive?",
    answer:
      "Hosts can get help with property listing setup, booking requests, payment coordination, and account management through the same support channels.",
  },
  {
    question: "How do I report a listing issue or misconduct?",
    answer:
      "Use the support contact form or email us with the listing URL, booking details, and a clear description so our team can investigate and take the appropriate action.",
  },
] as const;

const quickResources = [
  "Booking confirmation checklist",
  "How to manage profile settings",
  "Payment and refund guidelines",
  "Listing verification process",
  "Cancellation policy overview",
  "Safety guidance for guests",
] as const;

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Support Center"
        description="We’re here to help with bookings, payments, listings, and account questions across Indanga."
        actions={
          <Button asChild>
            <Link href="mailto:support@indanga.com">Contact support</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Clock3 className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average response</p>
              <p className="mt-1 text-xl font-semibold">24 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified listings</p>
              <p className="mt-1 text-xl font-semibold">Secure access</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600">
              <CircleHelp className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most asked</p>
              <p className="mt-1 text-xl font-semibold">Bookings</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How can we help?</CardTitle>
              <CardDescription>
                Choose the area that matches your issue and get fast guidance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {supportAreas.map(({ icon: Icon, title, description, items }) => (
                <div
                  key={title}
                  className="rounded-2xl border bg-muted/30 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently asked questions</CardTitle>
              <CardDescription>
                Helpful answers for guests, tenants, and hosts on Indanga.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map(({ question, answer }) => (
                <div key={question} className="rounded-xl border bg-background p-4">
                  <h3 className="font-medium">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact us</CardTitle>
              <CardDescription>
                Reach the Indanga team directly for urgent assistance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactChannels.map(({ icon: Icon, title, value, href, description }) => (
                <Link
                  key={title}
                  href={href}
                  className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm text-primary">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Helpful resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {quickResources.map((resource) => (
                  <li key={resource} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href="mailto:support@indanga.com?subject=Request%20for%20help">
                  Request support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
