import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { TermsContent } from "@/components/legal/terms-content";

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar solid />
      <main className="flex-1 px-4 pt-24 pb-8 text-foreground sm:px-6 sm:pt-28 sm:pb-12">
        <article className="mx-auto max-w-4xl">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to account creation
          </Link>

          <header className="mt-8 border-b border-border pb-6 sm:mt-12">
            <p className="text-sm font-semibold uppercase text-primary">
              INDANGA COMPANY LTD | INDANGA PLATFORM
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Terms &amp; Conditions
            </h1>
            <div className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Document ID: IND-LGL-001 | Version 1.0</p>
              <p>Effective Date: 29 September 2026</p>
              <p>Jurisdiction: Republic of Rwanda</p>
              <p>
                Document Status: Approved for publication subject to final corporate authorization
                and any legally required review
              </p>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">
              These Terms govern use of the INDANGA platform and are to be read together with the
              Indanga policies identified in Section 30.
            </p>
          </header>

          <section className="border-b border-border py-6 sm:py-8">
            <h2 className="text-xl font-semibold">Document Status and Interpretation</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This document constitutes the principal Terms &amp; Conditions governing access to and
              use of the INDANGA platform operated by Indanga Company Ltd. It is intended for
              publication and implementation subject to the Company&apos;s final corporate approval
              and any legally required review.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              References in this document to a payment provider, payment gateway, payment network,
              issuing bank, acquiring institution or financial institution refer to third-party
              payment infrastructure and participants applicable to the relevant transaction.
              Indanga&apos;s relationship with its integrated payment provider does not make that
              provider a party to the customer&apos;s ordinary property, accommodation, vehicle or
              service dispute unless the matter specifically concerns payment processing or
              settlement.
            </p>
          </section>

          <div className="py-6 sm:py-8">
            <TermsContent />
          </div>

          <section className="border-t border-border py-6 sm:py-8">
            <h2 className="text-xl font-semibold">Document Control</h2>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-[minmax(10rem,0.4fr)_1fr]">
              {[
                ["Document", "Indanga Terms & Conditions"],
                ["Document ID", "IND-LGL-001"],
                ["Version", "1.0"],
                ["Company", "Indanga Company Ltd"],
                ["Platform", "INDANGA"],
                ["Effective Date", "29 September 2026"],
                [
                  "Review Cycle",
                  "At least annually and whenever material legal, platform, payment or operational changes occur",
                ],
                ["Document Owner", "Indanga Company Ltd"],
                [
                  "Status",
                  "Approved for publication subject to final corporate authorization and any legally required review",
                ],
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
