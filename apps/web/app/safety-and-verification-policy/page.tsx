import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import {
  safetyPolicyMeta,
  safetyPolicyReferences,
  safetyPolicySections,
} from "@/lib/safety-policy-content";

export default function SafetyAndVerificationPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar solid />
      <main className="flex-1 px-4 pt-24 pb-8 text-foreground sm:px-6 sm:pt-28 sm:pb-12">
        <article className="mx-auto max-w-4xl">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Support
          </Link>

          <header className="mt-8 border-b border-border pb-6 sm:mt-12">
            <p className="text-sm font-semibold uppercase text-primary">
              INDANGA COMPANY LTD | INDANGA PLATFORM
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {safetyPolicyMeta.title}
            </h1>
            <div className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                Document ID: {safetyPolicyMeta.documentId} | Version {safetyPolicyMeta.version}
              </p>
              <p>Effective Date: {safetyPolicyMeta.effectiveDate}</p>
              <p>Last Updated: {safetyPolicyMeta.lastUpdated}</p>
              <p>Jurisdiction: Republic of Rwanda</p>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 sm:p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm leading-7 text-muted-foreground">
                This Policy explains how INDANGA reviews listings, communicates verification status,
                supports safer transactions, and handles reports of inaccurate, suspicious, or
                unsafe activity.
              </p>
            </div>
          </header>

          <div className="divide-y divide-border">
            {safetyPolicySections.map((section, index) => (
              <section key={section.title} className="py-6 sm:py-8">
                <h2 className="text-xl font-semibold">
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.closingParagraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <section className="border-t border-border py-6 sm:py-8">
            <h2 className="text-xl font-semibold">References</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
              {safetyPolicyReferences.map((reference) => (
                <li key={reference.label}>{reference.label}</li>
              ))}
            </ol>
          </section>

          <section className="border-t border-border py-6 sm:py-8">
            <h2 className="text-xl font-semibold">Document Control</h2>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[minmax(10rem,0.4fr)_1fr]">
              {[
                ["Document", "Indanga Safety and Verification Policy"],
                ["Document ID", safetyPolicyMeta.documentId],
                ["Version", safetyPolicyMeta.version],
                ["Company", "Indanga Company Ltd"],
                ["Platform", "INDANGA"],
                ["Effective Date", safetyPolicyMeta.effectiveDate],
                ["Last Updated", safetyPolicyMeta.lastUpdated],
                [
                  "Review Cycle",
                  "At least annually and whenever material legal, platform, payment or operational changes occur",
                ],
                ["Document Owner", "Indanga Company Ltd"],
              ].map(([field, value]) => (
                <div key={field} className="contents">
                  <dt className="bg-muted px-4 py-3 text-sm font-medium">{field}</dt>
                  <dd className="bg-background px-4 py-3 text-sm text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
