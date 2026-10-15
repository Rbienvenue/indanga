export const providerAgreementNotice =
  "This is a commercial and legal drafting template, not legal advice. Rwanda counsel should review the provider relationship, tax treatment, agency language, commissions, payment arrangements, employment/independent-contractor status, licensing obligations, dispute clause, and sector-specific requirements before onboarding providers.";

export type ProviderAgreementSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const providerAgreementSections: ProviderAgreementSection[] = [
  {
    title: "Parties and acceptance",
    paragraphs: [
      "This Provider Agreement is between Indanga Company Ltd (Indanga, we, us) and the person or organisation accepted to list, promote, offer, or fulfil a property, accommodation, vehicle, or related service through INDANGA (Provider, you). By creating a provider account, submitting a listing, accepting these terms electronically, or continuing to use provider tools, you agree to this Agreement, the Terms of Use, Safety and Verification Policy, Prices and Fees, Refund and Cancellation Policy, and Privacy Policy.",
    ],
  },
  {
    title: "Relationship of the parties",
    paragraphs: [
      "Indanga operates a digital marketplace and technology platform. Unless a written addendum expressly says otherwise, Indanga is not the owner, lessor, hotel operator, vehicle owner, employer, partner, agent, or insurer of the Provider. The Provider is responsible for the listed property, accommodation, vehicle, or service, including legal authority, condition, safety, availability, quality, delivery, taxes, licences, staff, subcontractors, and customer obligations.",
      "Counsel must confirm: whether any category uses agency, payment-collection, merchant-of-record, commission-agent, or other legal structure.",
    ],
  },
  {
    title: "Eligibility and authority",
    paragraphs: ["You confirm that:"],
    bullets: [
      "you are legally able to enter this Agreement;",
      "the information you provide is accurate;",
      "you have authority to list and offer each property, room, vehicle, or service;",
      "you have all permissions, licences, registrations, insurance, and approvals required for your activity; and",
      "you will provide evidence of authority when INDANGA reasonably requests it.",
    ],
  },
  {
    title: "Onboarding and verification",
    paragraphs: [
      "INDANGA may request:",
      "You authorise Indanga to verify information with relevant documents, service providers, authorities, or other lawful sources. Verification status is described in the Safety and Verification Policy. Verification or approval does not transfer responsibility for accuracy, legality, safety, or delivery to Indanga.",
    ],
    bullets: [
      "legal name and identity information;",
      "business registration information;",
      "tax information;",
      "ownership, lease, management, or agency authority;",
      "property, hotel, or vehicle documentation;",
      "licences, permits, inspections, insurance, or safety documents where relevant; and",
      "bank, mobile-money, or payment-settlement information.",
    ],
  },
  {
    title: "Listing requirements",
    paragraphs: [
      "Each listing must be accurate, complete, current, and suitable for the category. You must provide:",
      "You must not publish a listing that is duplicate, fictitious, unauthorised, misleading, discriminatory, unlawful, unsafe, unavailable, or materially different from what a customer will receive.",
    ],
    bullets: [
      "accurate title and description;",
      "actual photographs or photographs you are authorised to use;",
      "correct location and address information;",
      "price, unit, currency, taxes, fees, deposit, and applicable charges;",
      "availability and booking restrictions;",
      "amenities, vehicle features, or service inclusions;",
      "cancellation and refund conditions;",
      "provider contact and response information; and",
      "any material safety, accessibility, legal, or operational limitation.",
    ],
  },
  {
    title: "Updating listings",
    paragraphs: [
      "You must update price and availability promptly after any change. You must not accept a booking while knowing that the listing is unavailable or that the displayed price is materially wrong. If a listing becomes unavailable, you must immediately mark it unavailable and notify Indanga of any affected confirmed booking.",
    ],
  },
  {
    title: "Customer communications",
    paragraphs: [
      "You must respond to genuine customer enquiries and booking requests within the response time shown on the Platform or within [insert provider SLA]. Communications must be truthful, respectful, professional, and consistent with the listing. You must not pressure a customer to pay outside the authorised process, hide a transaction, provide false information, or avoid a support or reporting channel.",
    ],
  },
  {
    title: "Booking acceptance and fulfilment",
    paragraphs: [
      "You must honour each confirmed booking unless a lawful and legitimate reason prevents fulfilment. If you cannot fulfil a confirmed booking, notify Indanga immediately, explain the reason, and cooperate with customer communication, alternative arrangements, cancellation, refund, and complaint handling. You must provide the property, room, vehicle, or service substantially as described, at the agreed price and under the agreed terms. You must disclose any material change before fulfilment.",
    ],
  },
  {
    title: "Safety and legal compliance",
    paragraphs: [
      "You must comply with applicable Rwanda laws, regulations, licences, permits, consumer obligations, tax obligations, health and safety standards, vehicle requirements, accommodation requirements, and sector-specific rules. You are responsible for maintaining safe premises, vehicles, equipment, staff, and procedures. You must report any event that could affect customer safety, payment integrity, legal compliance, or the continued availability of a listing.",
    ],
  },
  {
    title: "Pricing and fees",
    paragraphs: [
      "You must supply accurate prices and identify whether they are per night, day, month, trip, room, vehicle, or another unit. You must disclose taxes, deposits, service charges, delivery or pickup charges, utilities, insurance, cancellation deductions, and other mandatory costs. The commercial fee model is:",
      "Indanga may not alter a confirmed customer price without applying the applicable booking terms and law.",
    ],
    bullets: [
      "Provider commission: [insert percentage or amount]",
      "Listing or subscription fee: [insert amount or none]",
      "Payment-processing treatment: [insert]",
      "Applicable taxes and deductions: [insert]",
      "Settlement schedule: [insert]",
      "Chargeback or refund treatment: [insert]",
    ],
  },
  {
    title: "Payments and settlement",
    paragraphs: [
      "Where Indanga or its payment provider processes customer payments, settlement to the Provider is subject to successful processing, applicable fees, taxes, refunds, chargebacks, fraud or compliance review, reserves or holdbacks, and the payment provider's settlement procedures. A payment initiated by a customer is not necessarily final settlement to the Provider. You must not represent a transaction as finally settled before the Platform confirms it.",
      "Payment provider: [insert legal name and public terms link].",
    ],
  },
  {
    title: "Refunds and cancellations",
    paragraphs: [
      "You must comply with listing-specific cancellation conditions and the Refund and Cancellation Policy. You must not create cancellation terms that contradict the terms shown to the customer. If you cancel without a valid basis, fail to fulfil a confirmed booking, materially misdescribe the service, or cause a customer remedy, Indanga may apply the available contractual or lawful remedy, including customer refund, account restriction, listing removal, or recovery of amounts owed.",
    ],
  },
  {
    title: "Complaints and investigations",
    paragraphs: [
      "You must cooperate promptly with complaints, refund requests, payment investigations, fraud reviews, safety reports, and regulator or law-enforcement requests where lawful. You must preserve relevant records, including communications, booking information, payment references, availability records, photographs, delivery evidence, and incident records for at least [insert retention period] or the period required by law. You must not retaliate against a customer for making a good-faith report or complaint.",
    ],
  },
  {
    title: "Customer data and confidentiality",
    paragraphs: [
      "You may use customer information only to respond to enquiries, fulfil bookings, provide the agreed service, handle support, and comply with law. You must protect it from unauthorised access, disclosure, copying, sale, marketing, or unrelated use. You must not export, scrape, or retain customer information beyond what is necessary and lawful. Report a suspected personal-data incident to Indanga without delay at support@indanga.com. The Privacy Policy explains Platform processing. Rwanda's data-protection framework includes duties relating to lawful processing, information at collection, security, records, breach response, and certain cross-border transfers.",
    ],
  },
  {
    title: "Content licence",
    paragraphs: [
      "You grant Indanga a non-exclusive, worldwide, royalty-free licence to host, reproduce, adapt, translate, display, distribute, and promote your listing content during the term of this Agreement and for reasonable archival or legal purposes after termination. You confirm that you have the rights needed for the licence and that the content does not infringe intellectual-property, privacy, image, publicity, or other rights.",
    ],
  },
  {
    title: "Indanga tools and communications",
    paragraphs: [
      "Indanga may provide listing tools, search placement, booking tools, payment collection, customer support, analytics, and provider dashboards. Features may change, be unavailable, or be subject to eligibility rules. You consent to operational messages about listings, bookings, payment, verification, safety, complaints, and this Agreement. Marketing communications should be handled according to applicable consent and opt-out requirements.",
    ],
  },
  {
    title: "Ranking, promotion, and featured listings",
    paragraphs: [
      "Search ranking or featured placement may depend on relevance, availability, quality, completeness, customer experience, response behaviour, paid promotion, or other disclosed factors. If a listing is paid, sponsored, featured, or promoted, label it clearly: Featured listing. Do not describe paid placement as an independent recommendation.",
    ],
  },
  {
    title: "Indemnity and responsibility",
    paragraphs: [
      "To the extent permitted by law, you agree to compensate Indanga for reasonable claims, losses, costs, penalties, or expenses arising from your breach of this Agreement, inaccurate listing, unlawful conduct, failure to fulfil a booking, personal-data misuse, safety incident caused by your acts or omissions, or infringement of another person's rights.",
    ],
  },
  {
    title: "Insurance",
    paragraphs: [
      "You must maintain insurance required by law and appropriate for your activity. This may include property, public liability, vehicle, professional, employer, or other coverage. Required coverage: [insert category-specific insurance requirements]. Indanga does not provide insurance unless a separate written product expressly says so.",
    ],
  },
  {
    title: "Suspension and removal",
    paragraphs: [
      "Indanga may pause, restrict, delist, suspend, or terminate provider access where there is a safety risk, suspected fraud, inaccurate information, non-fulfilment, repeated cancellation, payment risk, legal breach, customer harm, privacy risk, or other material breach. Where appropriate, Indanga may provide notice and a review route. Immediate action may be taken where necessary to prevent harm, fraud, evidence destruction, or unlawful activity.",
    ],
  },
  {
    title: "Term and termination",
    paragraphs: [
      "This Agreement begins when accepted and continues until terminated by either party or under this Agreement. A Provider may request closure, but must complete or appropriately resolve existing confirmed bookings, complaints, payments, refunds, and data obligations. Termination does not automatically cancel an existing confirmed booking or remove obligations that by their nature continue.",
    ],
  },
  {
    title: "Confidentiality",
    paragraphs: [
      "Each party must protect confidential information received from the other and use it only for the purposes of this Agreement. This does not prevent disclosure required by law, regulator, court, payment provider, or professional adviser subject to lawful confidentiality protections.",
    ],
  },
  {
    title: "Governing law and disputes",
    paragraphs: [
      "This Agreement is governed by the laws of the Republic of Rwanda. Formal dispute venue and procedure: [Insert counsel-approved Rwanda court, arbitration, mediation, notice, and escalation clause].",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "Indanga may update this Agreement to reflect Platform, payment, legal, or operational changes. Material changes will show an effective date and may require renewed acceptance where appropriate.",
    ],
  },
  {
    title: "Notices and contact",
    paragraphs: ["Provider notices should be sent to: Indanga Company Ltd"],
    bullets: [
      "General: info@indanga.com",
      "Support: support@indanga.com",
      "Phone: +250 788 765 547",
    ],
  },
];

export function ProviderAgreementContent() {
  return (
    <div>
      <p className="rounded-lg bg-muted/60 px-4 py-3 text-xs leading-6 text-muted-foreground">
        {providerAgreementNotice}
      </p>
      <div className="mt-2 divide-y divide-border">
        {providerAgreementSections.map((section, index) => (
          <section key={section.title} className="py-5 first:pt-3 last:pb-0">
            <h3 className="text-base font-semibold">
              {index + 1}. {section.title}
            </h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
