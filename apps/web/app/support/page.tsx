"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
<<<<<<< Updated upstream
  BadgeCheck,
  CircleHelp,
  Clock3,
  TriangleAlert,
=======
  BadgeDollarSign,
  CalendarX2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Headset,
  House,
  Hotel,
  Search,
  ShieldCheck,
  ShieldAlert,
  SquareUser,
  Store,
  TriangleAlert,
  Flag,
  RefreshCcw,
  LifeBuoy,
  FileText,
  BadgeCheck,
>>>>>>> Stashed changes
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  faqItems,
  fraudWarning,
  mostAskedFaqIds,
  quickResources,
  supportAreas,
  supportChannels,
} from "@/lib/support-content";
=======
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SUPPORT_EMAIL = "support@indanga.com";
const SUPPORT_PHONE = "+250 788 765 547";
const SUPPORT_PHONE_HREF = "tel:+250788765547";

const supportCategories = [
  {
    icon: House,
    title: "Booking and reservations",
    description:
      "Check a booking, request a change, understand confirmation, or get help before your stay or rental.",
    articles: [
      "How do I book a home, hotel, or car?",
      "Is my booking confirmed?",
      "What happens after I send a booking request?",
      "How do I change my dates or guest details?",
      "Where can I find my booking reference?",
      "What should I do if the provider does not respond?",
    ],
  },
  {
    icon: BadgeDollarSign,
    title: "Prices and payments",
    description:
      "Understand the listed price, additional charges, deposits, payment status, and receipts.",
    articles: [
      "What is included in the listed price?",
      "Are taxes or service fees included?",
      "Why does the final price differ from the listing price?",
      "Is a deposit required?",
      "When do I pay?",
      "How do I know whether my payment was successful?",
    ],
  },
  {
    icon: CalendarX2,
    title: "Cancellations and refunds",
    description:
      "Find the cancellation deadline, understand refund eligibility, and track a refund request.",
    articles: [
      "How do I cancel a booking?",
      "Will I receive a full refund?",
      "What if the provider cancels?",
      "How long does a refund take?",
      "Can I change my booking instead of cancelling?",
      "How do I submit a refund request?",
    ],
  },
  {
    icon: FileCheck2,
    title: "Listings and verification",
    description:
      "Understand listing badges, report inaccurate information, or ask for a review of a property, hotel, or vehicle.",
    articles: [
      "What does “Reviewed by INDANGA” mean?",
      "What does “Verified by INDANGA” mean?",
      "How often is listing information checked?",
      "How can I report a wrong price or unavailable listing?",
      "How do I report a suspicious provider?",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety and trust",
    description: "Learn how to protect your account, payment, and personal information.",
    articles: [
      "How do I stay safe when contacting a provider?",
      "Should I pay outside INDANGA?",
      "How do I report a suspicious payment request?",
      "How do I report harassment, fraud, or unsafe behaviour?",
    ],
  },
  {
    icon: SquareUser,
    title: "Account and profile",
    description: "Manage sign-in, contact details, saved listings, and account security.",
    articles: [
      "How do I create an account?",
      "I cannot sign in. What should I do?",
      "How do I reset my password?",
      "How do I delete my account?",
      "How does INDANGA use my personal information?",
    ],
  },
  {
    icon: Store,
    title: "For providers",
    description:
      "Get help listing a property, hotel room, or vehicle and managing enquiries and bookings.",
    articles: [
      "How do I become a provider?",
      "What information is required to create a listing?",
      "How do I update price and availability?",
      "How do I respond to a booking request?",
      "What happens if a customer reports a listing?",
    ],
  },
];

const commonQuestions = [
  {
    question: "How do I know whether my booking is confirmed?",
    answer:
      "Not always when you click. Some listings can be confirmed immediately, while others require the provider to confirm availability and the final price. Your booking is confirmed only when the confirmation message or booking reference is issued. Keep this reference for support, changes, or cancellations.",
  },
  {
    question: "What does the listed price include?",
    answer:
      "The listing price is the provider’s stated rate for the period shown. Depending on the listing, additional charges may include taxes, service fees, deposits, delivery or pickup fees, cleaning fees, insurance, utilities, or other disclosed costs. Review the price summary before confirming.",
  },
  {
    question: "How long does a refund take?",
    answer:
      "After INDANGA approves or initiates a refund, the payment provider, bank, card issuer, or mobile-money operator may need additional time to process it. Keep your transaction reference until the refund reaches your account.",
  },
  {
    question: "What does Reviewed by INDANGA mean?",
    answer:
      "We checked the information submitted by the provider before publishing the listing. Prices, availability, and conditions can change, so review the latest details before booking or paying.",
  },
  {
    question: "What should I do if a provider asks for payment outside INDANGA?",
    answer:
      "Do not pay through an unverified link or personal account. Use the payment process shown on the platform or confirm the payment instructions with INDANGA support first. Report any request to hide or bypass the official process.",
  },
  {
    question: "How do I report a suspicious listing?",
    answer:
      `Use Report this listing on the listing page or email ${SUPPORT_EMAIL} with the listing link, your booking reference if applicable, and a description of the concern. Do not send payment while the report is being reviewed.`,
  },
];

const fullFaq = [
  {
    question: "How do I book a property, hotel, or car?",
    answer:
      "Choose Homes, Hotels, or Cars, enter your search details, and open a listing that suits your needs. Review the photos, location, price, availability, provider information, and cancellation terms. Select Book now, Request to book, or Check availability, depending on the listing. Your booking is confirmed only when the confirmation message or booking reference is issued.",
  },
  {
    question: "What happens after I send a booking request?",
    answer:
      "We send the request to the provider and keep you updated. Your booking is not confirmed until availability and the final price have been confirmed. Keep your booking reference for follow-up questions.",
  },
  {
    question: "What if the provider does not respond?",
    answer:
      "Contact INDANGA support with the listing link or booking reference. We will follow up with the provider and help you look for another option if necessary.",
  },
  {
    question: "Why does the final price differ from the listing price?",
    answer:
      "The final price can change when you select dates, duration, room type, vehicle options, number of guests, delivery, or other services. Any known additional charges should appear in the price summary before you pay or confirm.",
  },
  {
    question: "Is a deposit required?",
    answer:
      "Some homes, hotels, and vehicles require a deposit. The amount, purpose, refund conditions, and refund timing should be shown before confirmation. If the deposit is not shown, ask the provider or contact INDANGA support before paying.",
  },
  {
    question: "When do I pay?",
    answer:
      "Payment timing depends on the listing and booking process. Do not send money through an unverified link or personal account. Follow the payment instructions shown through INDANGA or confirmed by the authorised provider.",
  },
  {
    question: "What should I do if I was charged twice?",
    answer:
      `Contact ${SUPPORT_EMAIL} immediately and include your booking reference, payment confirmation, amount, date, and payment method. Do not submit multiple refund requests for the same charge while the first request is under review.`,
  },
  {
    question: "How do I cancel a booking?",
    answer:
      "Open your booking or contact INDANGA support with your booking reference. Submit the cancellation request as soon as possible. Eligibility depends on the listing terms, cancellation time, booking status, payment status, and applicable law.",
  },
  {
    question: "Will I receive a full refund?",
    answer:
      "A full refund is not automatic. It may be available when the service is materially unavailable, the provider fails to deliver the confirmed service, the same payment was duplicated because of a confirmed platform error, or the applicable listing terms provide for it. Review the specific cancellation terms before booking.",
  },
  {
    question: "What if the provider cancels?",
    answer:
      "Contact support as soon as you receive the cancellation notice. INDANGA will review the transaction terms and help identify the available refund or alternative remedy.",
  },
  {
    question: "What does “Verified by INDANGA” mean?",
    answer:
      "INDANGA has completed the checks described beside the listing, which may include provider identity, location, photos, pricing, and availability. Verification does not guarantee future availability or replace your review of the booking terms.",
  },
  {
    question: "Should I pay outside INDANGA?",
    answer:
      "Do not pay through an unverified link or personal account. Use the payment process shown on the platform or confirm the payment instructions with INDANGA support first. Report any request to hide or bypass the official process.",
  },
  {
    question: "How do I list a property, hotel, or car?",
    answer:
      "Select Become a provider and create an account. Provide accurate photos, location, pricing, availability, amenities or vehicle details, contact information, and any documents requested for review. Keep your listing current after publication.",
  },
  {
    question: "What happens during listing review?",
    answer:
      "INDANGA reviews the information submitted by the provider and may request clarification or supporting documents. A listing may be approved, returned for changes, temporarily hidden, or removed if the information cannot be confirmed or violates the platform rules.",
  },
  {
    question: "How do providers update prices and availability?",
    answer:
      "Sign in to your provider account, open the relevant listing, and update the price, availability, photos, amenities, or terms. Changes should be saved before accepting a booking request.",
  },
  {
    question: "How does INDANGA use my information?",
    answer:
      "INDANGA may use account, booking, payment, verification, support, and technical information to operate the platform, process transactions, prevent fraud, resolve complaints, and comply with the law. Review the Privacy Policy for details and contact information.",
  },
  {
    question: "I cannot sign in. What should I do?",
    answer:
      `Check your email or phone number, request a password reset, and try again. If the problem continues, contact ${SUPPORT_EMAIL} and include the email or phone number linked to your account. Do not send your password.`,
  },
];

const quickActions = [
  {
    icon: Headset,
    title: "Contact support",
    description: "Tell us what happened and include your booking reference or listing link.",
    href: "#contact-form",
  },
  {
    icon: Flag,
    title: "Report a listing",
    description: "Report a wrong price, unavailable listing, or misleading information.",
    href: "#contact-form",
  },
  {
    icon: RefreshCcw,
    title: "Request a refund",
    description: "Send your booking reference and explain the reason for your request.",
    href: "#contact-form",
  },
  {
    icon: ShieldAlert,
    title: "Report a safety concern",
    description: "Report suspicious activity, fraud, harassment, or an unsafe situation.",
    href: "#contact-form",
  },
];

const guides = [
  { icon: FileText, title: "Booking confirmation checklist", href: "#faqs" },
  { icon: BadgeDollarSign, title: "Payment and refund guidelines", href: "#prices" },
  { icon: BadgeCheck, title: "Listing verification process", href: "#faqs" },
  { icon: FileCheck2, title: "Cancellation policy overview", href: "/refund-cancellation-policy" },
  { icon: ShieldCheck, title: "Safety guidance for guests", href: "#safety" },
];

const topicOptions = ["Booking", "Payment", "Refund", "Listing", "Safety", "Account", "Provider"] as const;

const supportSchema = z.object({
  topic: z.enum(topicOptions, { message: "Select what you need help with" }),
  bookingReference: z.string().optional(),
  listingLink: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Describe what happened (at least 10 characters)"),
  preferredContact: z.enum(["Email", "Phone"], { message: "Select a response method" }),
});

type SupportValues = z.infer<typeof supportSchema>;

function makeReference() {
  return `IND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
>>>>>>> Stashed changes

export default function Page() {
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      topic: "Booking",
      bookingReference: "",
      listingLink: "",
      email: "",
      phone: "",
      message: "",
      preferredContact: "Email",
    },
  });

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const pool = [...commonQuestions, ...fullFaq];
    return pool.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const onSubmit = (values: SupportValues) => {
    const ref = makeReference();
    setReference(ref);
    const subject = encodeURIComponent(`Support request ${ref} - ${values.topic}`);
    const body = encodeURIComponent(
      `Reference: ${ref}\nTopic: ${values.topic}\nBooking reference: ${values.bookingReference || "-"}\nListing link: ${values.listingLink || "-"}\nEmail: ${values.email}\nPhone: ${values.phone || "-"}\nPreferred contact: ${values.preferredContact}\n\n${values.message}`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fc]">
      <Navbar solid />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-28 pb-10"
          style={{
            backgroundImage: "url(/hero-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#0a2a5e]/80" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Support Center
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">How can we help?</h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/80">
              Search for answers about bookings, payments, listings, cancellations, or your
              account.
            </p>
            <div className="relative mx-auto mt-5 max-w-xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles"
                aria-label="Search help articles"
                className="h-11 bg-white pl-9"
              />
              {searchResults.length > 0 && (
                <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border bg-white text-left shadow-xl">
                  {searchResults.map((item) => (
                    <button
                      key={item.question}
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setOpenQuestion(item.question);
                        document
                          .getElementById("faqs")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="block w-full px-4 py-3 text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{item.question}</span>
                      <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">
                        {item.answer}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-3 text-[11px] text-white/70">
              Usually replies within 24 hours. For urgent booking or payment issues, include
              your booking reference.
            </p>
            <Button asChild className="mt-3 bg-[#0a7bd7] hover:bg-[#0869b8]">
              <Link href="#contact-form">Contact support</Link>
            </Button>
            <p className="mt-4 text-right text-xs font-semibold text-white/90">
              Discover Rwanda
              <span className="block">with confidence.</span>
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Browse by topic */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Support categories
            </p>
            <h2 className="text-xl font-bold">Browse by topic</h2>
            <p className="text-sm text-muted-foreground">
              Find help and useful information about using INDANGA.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supportCategories.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="size-4 -rotate-90 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>

          {/* Common questions */}
          <section id="faqs" className="scroll-mt-24">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Most asked questions
            </p>
            <h2 className="text-xl font-bold">Common questions</h2>
            <p className="text-sm text-muted-foreground">
              Find quick answers to the most common questions from our community.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {commonQuestions.map(({ question, answer }) => {
                const open = openQuestion === question;
                return (
                  <div key={question} className="rounded-xl border bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(open ? null : question)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                      aria-expanded={open}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{question}</span>
                        <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">
                          {answer}
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <p className="border-t px-4 py-3 text-sm leading-6 text-muted-foreground">
                        {answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

<<<<<<< Updated upstream
          <Card>
            <CardHeader>
              <CardTitle>Frequently asked questions</CardTitle>
              <CardDescription>
                Helpful answers for guests, tenants, and hosts on Indanga.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold">Most asked questions</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {mostAskedFaqIds.map((id) => {
                    const faq = faqItems.find((item) => item.id === id);
                    if (!faq) return null;
                    return (
                      <li key={id}>
                        <Link
                          href={`/support#faq-${faq.id}`}
                          className="text-primary hover:underline"
                        >
                          {faq.question}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {faqItems.map(({ id, question, answer }) => (
                <details
                  key={question}
                  id={`faq-${id}`}
                  className="group scroll-mt-28 rounded-xl border bg-background p-4"
                >
                  <summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                    {question}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
                </details>
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
              {supportChannels.map(({ icon: Icon, title, value, href, description }) => (
=======
          {/* Quick actions */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quick actions
            </p>
            <h2 className="text-xl font-bold">Need help with a specific issue?</h2>
            <p className="text-sm text-muted-foreground">
              Take action quickly with the most common support requests.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map(({ icon: Icon, title, description, href }) => (
>>>>>>> Stashed changes
                <Link
                  key={title}
                  href={href}
                  className="rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <ChevronDown className="size-4 -rotate-90 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                </Link>
              ))}
<<<<<<< Updated upstream
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                  <TriangleAlert className="size-4" />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{fraudWarning}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Helpful resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {quickResources.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="size-2 rounded-full bg-primary" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href="mailto:support@indanga.com?subject=Request%20for%20help">
                  Request support
                </Link>
=======
            </div>
          </section>

          {/* Safety + form */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div id="safety" className="scroll-mt-24 rounded-xl border border-red-100 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-red-700">
                <TriangleAlert className="size-5" />
                <h2 className="text-base font-bold">Stay safe</h2>
              </div>
              <p className="mt-2 text-sm font-medium">
                Never send a password, one-time security code, or full payment-card number.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Do not send money through an unverified link or personal account.
              </p>
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
                <Link href="#contact-form">Report a safety concern</Link>
>>>>>>> Stashed changes
              </Button>
            </div>

            <div
              id="contact-form"
              className="scroll-mt-24 rounded-xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-base font-bold">Contact INDANGA support</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tell us what happened and include your booking reference or listing link if
                you have one. Do not send passwords or full payment-card details.
              </p>
              {reference ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold">Your request has been received.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reference number: {reference}. We usually reply within 24 hours. Keep
                    this reference for follow-up.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    If you suspect fraud or unauthorised payment, contact your bank or
                    payment provider immediately as well as INDANGA support.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      setReference(null);
                      form.reset();
                    }}
                  >
                    Send another request
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                    noValidate
                  >
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What do you need help with?</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                            >
                              {topicOptions.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bookingReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking reference</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. IND-ABC123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="listingLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing link</FormLabel>
                          <FormControl>
                            <Input placeholder="Paste listing URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Phone number <span className="font-normal">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+250 7xx xxx xxx"
                              autoComplete="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred response method</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
                            >
                              <option value="Email">Email</option>
                              <option value="Phone">Phone</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>What happened?</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe the booking, payment, listing, or safety issue"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Never upload a password, one-time security code, or full
                      payment-card number.
                    </p>
                    <Button
                      type="submit"
                      className="bg-[#0a7bd7] hover:bg-[#0869b8] sm:col-span-2"
                      disabled={form.formState.isSubmitting}
                    >
                      Submit support request
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground sm:col-span-2">
                      We usually reply within 24 hours.
                    </p>
                  </form>
                </Form>
              )}
            </div>
          </section>

          {/* Guides */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Helpful resources
            </p>
            <h2 className="text-xl font-bold">Guides and resources</h2>
            <p className="text-sm text-muted-foreground">
              Explore our helpful guides to get the most out of INDANGA.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {guides.map(({ icon: Icon, title, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="flex items-center justify-between gap-2 rounded-xl border bg-white p-4 text-sm font-medium shadow-sm hover:border-primary/40"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    {title}
                  </span>
                  <ChevronDown className="size-4 -rotate-90 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>

          {/* More answers */}
          <section id="prices" className="scroll-mt-24 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold">More answers</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Booking, payment, cancellation, verification, provider, and account help.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {fullFaq.map(({ question, answer }) => (
                <div key={question} className="rounded-lg border bg-background p-4">
                  <h3 className="text-sm font-medium">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Still need help? {SUPPORT_EMAIL} | {SUPPORT_PHONE}
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={SUPPORT_PHONE_HREF}>Call {SUPPORT_PHONE}</a>
                </Button>
                <Button asChild size="sm">
                  <a href={`mailto:${SUPPORT_EMAIL}`}>Contact support</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Trust strip */}
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
              <Hotel className="size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Reviewed listings</p>
                <p className="text-xs text-muted-foreground">Checked before publishing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
              <BadgeCheck className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">Verified by INDANGA</p>
                <p className="text-xs text-muted-foreground">Identity and listing checks</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
              <LifeBuoy className="size-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold">Local support</p>
                <p className="text-xs text-muted-foreground">Usually replies within 24 hours</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
