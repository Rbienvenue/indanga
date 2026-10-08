import Link from "next/link";
import { BadgeCheck, CircleHelp, Clock3, TriangleAlert } from "lucide-react";

import { MessageButton } from "@/components/messages/message-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  faqItems,
  fraudWarning,
  mostAskedFaqIds,
  quickResources,
  supportAreas,
  supportChannels,
} from "@/lib/support-content";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Support Center"
        description="We’re here to help with bookings, payments, listings, and account questions across Indanga."
        actions={<MessageButton />}
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
          <Card id="faqs">
            <CardHeader>
              <CardTitle>How can we help?</CardTitle>
              <CardDescription>
                Choose the area that matches your issue and get fast guidance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {supportAreas.map(({ icon: Icon, title, description, items }) => (
                <div key={title} className="rounded-2xl border bg-muted/30 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
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
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
