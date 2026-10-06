import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";

const termsSections = [
  {
    title: "Introduction",
    paragraphs: [
      'These Terms and Conditions govern access to and use of the INDANGA platform, including its website, applications, software interfaces, databases and related digital services operated by Indanga Company Ltd ("Indanga", "we", "us" or "our").',
      "INDANGA is a digital platform designed to make it easier for customers to discover, compare, enquire about, reserve, purchase or otherwise access approved properties, accommodation, vehicles, local places and other listings or services made available through the platform.",
      "These Terms establish the legal framework governing the relationship between Indanga and users of the platform, including customers, property owners, service providers, vendors, agents, commissioners and other authorized participants.",
    ],
  },
  {
    title: "Definitions",
    paragraphs: [
      '"Platform" means the INDANGA website, applications, software, interfaces, databases and related digital services operated by Indanga Company Ltd.',
      '"Indanga" means Indanga Company Ltd.',
      '"Customer" means an individual or organization using the Platform to search for, enquire about, reserve, purchase or access a listing or service.',
      '"Provider" means a property owner, landlord, accommodation provider, vehicle provider, business, service provider or other person authorized to offer a listing through INDANGA.',
      '"Agent" or "Commissioner" means a person authorized by Indanga or a Provider to facilitate or support transactions or listings.',
      '"Listing" means information published on the Platform concerning a property, accommodation, vehicle, business, service, place or other approved offering.',
      '"Transaction" means a payment, booking, reservation, purchase or other commercially relevant transaction conducted through or in connection with the Platform.',
      '"Payment Gateway" means the integrated third-party payment infrastructure used by Indanga to process supported customer payments.',
      '"Payment Provider" means the third-party provider responsible for payment processing and related payment infrastructure.',
      '"Payment Risk Reserve" or "Rolling Reserve" means an amount temporarily withheld by the Payment Provider from amounts otherwise available for settlement, where applicable, to manage potential payment-related risks, including qualifying refunds, chargebacks, fraudulent or unauthorized transactions and other liabilities under the applicable payment arrangements.',
      '"Chargeback" means a reversal or repayment claim relating to a previously processed transaction initiated through an issuing bank, payment scheme, financial institution or other applicable payment mechanism.',
      '"Refund" means an approved return or reversal of a payment in accordance with Indanga\'s applicable refund rules and payment-processing procedures.',
    ],
  },
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing, registering on, listing through or transacting through INDANGA, the relevant person agrees to comply with these Terms and the policies incorporated into them.",
      "Users must provide accurate information and must have the legal capacity and authority required to enter into transactions they undertake.",
      "Users who do not agree to these Terms should not use the Platform.",
    ],
  },
  {
    title: "Nature of the INDANGA Platform",
    paragraphs: [
      "INDANGA operates as a digital marketplace and technology platform connecting customers with Providers and other approved participants.",
      "Unless expressly stated otherwise for a particular service, Indanga does not represent that it owns every property, vehicle, accommodation facility, business or service displayed on the Platform.",
      "Providers remain responsible for the accuracy, legality, availability, quality and delivery of the goods or services they offer.",
      "Indanga may facilitate discovery, communication, verification, booking, transaction processing, payment collection, recordkeeping, customer support and related platform functions.",
    ],
  },
  {
    title: "Provider Responsibility",
    paragraphs: [
      "Providers are responsible for the accuracy and legality of their Listings; having the legal right or authorization to offer the relevant property or service; maintaining accurate prices and availability; providing the service represented on the Platform; honoring confirmed transactions; complying with applicable law; cooperating with Indanga investigations; responding to legitimate customer complaints; and providing evidence of service delivery where reasonably required.",
      "Providers must not knowingly publish false, misleading, fraudulent or unauthorized Listings.",
      "Indanga may request supporting documents or information before approving or maintaining a Listing.",
    ],
  },
  {
    title: "Listing Accuracy",
    paragraphs: [
      "Indanga seeks to maintain reliable and useful information, but information may originate from Providers and other authorized sources.",
      "Providers must promptly update availability, pricing, location, property or service descriptions, photographs, amenities, contact information, restrictions and other material information.",
      "Indanga may suspend, restrict or remove a Listing where there is reasonable concern regarding its accuracy, legality, safety, authenticity or compliance with Platform rules.",
    ],
  },
  {
    title: "User Responsibilities",
    paragraphs: [
      "Users must not create fraudulent accounts, impersonate another person, submit false information, manipulate bookings or transactions, use stolen or unauthorized payment credentials, deliberately initiate fraudulent payment disputes, interfere with Platform security, introduce malicious software, attempt unauthorized access to another account, scrape or exploit Platform data without authorization, use the Platform for unlawful purposes, or bypass legitimate Platform charges or transaction procedures through deceptive means.",
    ],
  },
  {
    title: "Accounts and Security",
    paragraphs: [
      "Where account registration is required, users are responsible for maintaining the confidentiality of their credentials.",
      "Users must promptly notify Indanga of suspected unauthorized access, account compromise, payment misuse, fraudulent activity or other security incidents.",
      "Indanga may temporarily restrict an account where necessary to protect the user, other users, Providers, the payment system or the Platform.",
    ],
  },
  {
    title: "Prices and Transaction Information",
    paragraphs: [
      "Prices displayed on INDANGA are subject to the relevant Listing and transaction page.",
      "Before completing a transaction, the customer should review the applicable price, taxes or charges where disclosed, cancellation conditions, refund conditions, applicable service or transaction charges, payment method and other material transaction conditions.",
      "The final amount presented at checkout shall govern the transaction, subject to correction of manifest errors and applicable transaction rules.",
    ],
  },
  {
    title: "Payment Processing",
    paragraphs: [
      "INDANGA may use an integrated third-party Payment Gateway to process payments.",
      "Payment processing is subject to the payment method selected, the Payment Provider's processing procedures, applicable payment network rules, transaction authorization, fraud and risk controls, applicable law and Indanga's Payment & Transaction Terms.",
      "A payment attempt does not necessarily constitute a successful transaction until the applicable payment system confirms successful authorization and processing.",
      "Under the current ITEC payment arrangement, the Payment Gateway/API infrastructure is used for payment services and settlement of collected monies is made to the Client's nominated bank account in accordance with the applicable agreement.",
    ],
  },
  {
    title: "Payment Risk Reserve / Rolling Reserve",
    paragraphs: [
      "Where applicable, the Payment Provider may temporarily retain a Payment Risk Reserve or Rolling Reserve from transaction proceeds.",
      "The reserve is not an Indanga service fee and is not an additional 10% payment charge imposed by Indanga on customers. It is a payment-risk mechanism applied by the Payment Provider under the applicable payment arrangement.",
      "Under the current ITEC agreement, the rolling reserve is stated as 10% of transactions with a 180-day holdback period, subject to the contractual conditions governing its use and release.",
      "The reserve may be used or retained in accordance with the applicable payment-provider agreement for qualifying payment-related liabilities, including eligible refunds, chargebacks, fraudulent or unauthorized transactions and applicable fees or fines.",
      "Where no applicable liability requires the reserve to be applied, the applicable amount is released in accordance with the Payment Provider's settlement procedures. The existence of the reserve does not mean that a customer is automatically charged an additional 10%.",
    ],
  },
  {
    title: "Fraudulent and Unauthorized Transactions",
    paragraphs: [
      "INDANGA prohibits unauthorized card use, use of stolen payment credentials, fraudulent transactions, deliberately false payment claims, unlawful use of the Platform and manipulation of payment systems.",
      "Indanga may cooperate with the Payment Provider, financial institutions, payment schemes, law-enforcement authorities and other competent authorities where legally required or reasonably necessary to investigate suspected fraud or unlawful activity.",
      "Where a transaction is subject to fraud review or another payment-risk process, the relevant transaction, refund or settlement may be delayed or placed on hold pending the applicable review.",
    ],
  },
  {
    title: "Chargebacks",
    paragraphs: [
      "Customers may have rights to dispute certain transactions through the applicable financial institution or payment scheme. However, fraudulent or abusive use of chargeback mechanisms is prohibited.",
      "Where a legitimate chargeback occurs, Indanga may be required to provide relevant transaction and service-delivery information to the Payment Provider.",
      "Providers may be required to supply Indanga with evidence necessary to respond to chargeback or transaction inquiries.",
      "Payment-provider rules and payment-network procedures may operate independently of Indanga's ordinary customer complaint process.",
    ],
  },
  {
    title: "Refunds",
    paragraphs: [
      "Refunds are governed by the Indanga Refund & Cancellation Policy.",
      "A refund may depend upon the reason for cancellation, the applicable Listing conditions, whether the service was delivered, whether the transaction was fraudulent, whether a chargeback has already been initiated, transaction status, applicable payment-provider procedures and other circumstances relevant to the transaction.",
      "Approval of a refund by Indanga does not necessarily mean that funds will reach the customer immediately, because payment reversal and settlement may depend upon the applicable payment channel and Payment Provider.",
      "Indanga does not represent the Payment Risk Reserve as a customer-facing refund fee.",
    ],
  },
  {
    title: "Cancellation",
    paragraphs: [
      "Customers and Providers must comply with the cancellation conditions applicable to the relevant Listing or transaction.",
      "Indanga may establish different cancellation rules for different categories of services.",
      "The applicable cancellation conditions shall be communicated to the customer before or during the transaction where reasonably practicable.",
    ],
  },
  {
    title: "Customer Complaints",
    paragraphs: [
      "Customers may report inaccurate Listings, unavailable services, Provider misconduct, payment problems, unauthorized transactions, suspected fraud, service non-delivery and other violations of these Terms.",
      "Indanga will process complaints according to its Complaint & Dispute Resolution Procedure.",
      "Indanga may request reasonable evidence necessary to investigate a complaint, refund request, fraud report or transaction dispute.",
    ],
  },
  {
    title: "Provider Payments and Settlement",
    paragraphs: [
      "Where a Provider is entitled to receive funds from a transaction, settlement is subject to successful payment processing, applicable Indanga fees or commissions, payment-provider charges, refunds, chargebacks, fraud investigations, applicable reserves or holdbacks, applicable taxes and other contractual deductions.",
      "A Provider must not treat a transaction as finally settled merely because a customer has initiated payment.",
      "Provider settlement timing may therefore differ from the date on which a customer initiates a transaction.",
    ],
  },
  {
    title: "Payment Provider Relationship",
    paragraphs: [
      "The Payment Provider is a separate service provider responsible for the payment infrastructure supplied to Indanga.",
      "Indanga's customer-facing policies distinguish between Indanga's obligations and payment-processing functions controlled by the Payment Provider, acquiring institutions, payment schemes or financial institutions.",
      "Ordinary disputes concerning the quality, availability, description or delivery of a property or service remain subject to Indanga's customer/provider procedures and do not automatically become disputes with the Payment Provider.",
    ],
  },
  {
    title: "Data Protection",
    paragraphs: [
      "Indanga processes personal information in accordance with its Privacy & Data Protection Policy and applicable law.",
      "Information may be processed for account administration, Listing management, booking, payment processing, fraud prevention, transaction verification, customer support, legal compliance, dispute resolution and security.",
      "Where payment processing involves third-party infrastructure, relevant transaction and technical information may be processed or exchanged as reasonably necessary for payment authorization, settlement, fraud prevention, reconciliation, chargeback handling and legal compliance.",
      "Indanga will not represent that it stores sensitive payment credentials unless its actual technical architecture and lawful basis support that representation.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, Indanga owns or lawfully controls its Platform technology, branding, content and other proprietary materials.",
      "Providers retain ownership of materials they lawfully own, subject to the licenses necessary for publication and operation of their Listings.",
      "Users must not copy, reproduce, modify, distribute or commercially exploit Indanga's proprietary materials without authorization.",
      "The Payment Gateway and related provider technology remain subject to the intellectual-property rights established by the applicable payment-provider agreement.",
    ],
  },
  {
    title: "Platform Availability",
    paragraphs: [
      "Indanga will seek to maintain reasonable availability of the Platform.",
      "Temporary interruption may occur because of maintenance, technical failures, telecommunications problems, payment-provider interruptions, banking-system interruptions, cybersecurity incidents, force majeure, regulatory requirements or circumstances outside Indanga's reasonable control.",
    ],
  },
  {
    title: "Suspension and Termination",
    paragraphs: [
      "Indanga may suspend, restrict or terminate an account or Listing where reasonably necessary because of fraud, unlawful activity, serious breach of these Terms, false information, misuse of the Platform, security threats, repeated material customer complaints, unauthorized payment activity or violation of Provider Rules.",
      "Termination of an account does not automatically extinguish rights or liabilities that arose before termination.",
      "Where a payment or transaction is under investigation, Indanga may retain relevant records and cooperate with the applicable Payment Provider or competent authority after account restriction or termination.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "INDANGA may integrate third-party services including payment providers, communication services, mapping services, hosting infrastructure, analytics, identity verification and security services.",
      "The availability and operation of third-party services may be governed by their respective contractual and technical terms.",
      "Indanga will seek to identify material third-party payment-processing relationships where required by law or its applicable policies.",
    ],
  },
  {
    title: "Limitation and Platform Role",
    paragraphs: [
      "Indanga does not guarantee that every Provider, Listing or service will meet every customer's expectations.",
      "Indanga will maintain reasonable procedures designed to review Listings, address complaints, combat fraud, support transaction processing, remove prohibited content and facilitate legitimate disputes.",
      "Nothing in these Terms excludes rights or liabilities that cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    title: "Indemnification",
    paragraphs: [
      "To the extent permitted by applicable law, a user or Provider may be responsible for losses, claims, costs or liabilities arising from their breach of these Terms, fraudulent activity, unlawful conduct, unauthorized Listings, misuse of payment systems, infringement of third-party rights, or negligent or intentional misconduct.",
    ],
  },
  {
    title: "Changes to These Terms",
    paragraphs: [
      "Indanga may update these Terms where reasonably necessary because of changes to the Platform, changes to services, regulatory requirements, payment-provider requirements, security requirements or operational changes.",
      "Material changes should be communicated through an appropriate channel where required.",
      "The version published on the Platform shall identify its effective date and version number.",
    ],
  },
  {
    title: "Governing Law",
    paragraphs: [
      "These Terms shall be interpreted in accordance with the laws of the Republic of Rwanda, subject to applicable mandatory legal requirements.",
    ],
  },
  {
    title: "Dispute Resolution",
    paragraphs: [
      "Indanga will seek to resolve customer and Provider disputes through its internal complaint and dispute-resolution process before escalation where appropriate.",
      "Where a dispute cannot be resolved internally, the parties may pursue remedies available under applicable Rwandan law.",
      "Disputes specifically concerning payment processing may additionally be subject to the applicable procedures of the Payment Provider, payment scheme, acquiring institution or other relevant financial institution.",
      "Nothing in this section requires a customer to surrender any mandatory statutory right or remedy.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Indanga Company Ltd",
      "Website: www.indanga.com",
      "General / Customer Support Email: info@indanga.com",
      "Additional authorized contact: ntakishunter@gmail.com",
    ],
  },
  {
    title: "Related Policies and Order of Reference",
    paragraphs: [
      "These Terms should be read together with the Indanga Refund & Cancellation Policy, Privacy & Data Protection Policy, Cookie Policy, User & Provider Agreement, Property Listing & Provider Rules, Complaint & Dispute Resolution Procedure, and Payment & Transaction Terms.",
      "Where a specific policy contains more detailed rules for a particular subject, that policy applies to that subject together with these Terms, provided that it does not contradict mandatory law.",
      "Where a payment-provider rule applies specifically to payment processing, authorization, settlement, chargebacks, fraud controls or payment-network requirements, the applicable payment-provider/payment-network rule may govern the technical payment process. Indanga remains responsible for its own customer-facing obligations and policies.",
    ],
  },
] as const;

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

          <div className="divide-y divide-border">
            {termsSections.map((section, index) => (
              <section key={section.title} className="py-6 sm:py-8">
                <h2 className="text-xl font-semibold">
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
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
