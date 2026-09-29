import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "Purpose and Regulatory Framework",
    paragraphs: [
      "This Refund & Cancellation Policy (the \"Policy\") establishes the circumstances in which a customer or Provider may cancel a transaction, the circumstances in which a refund may be approved, the basis on which refund amounts may be determined, and the manner in which approved refunds are processed through the INDANGA Platform and applicable payment infrastructure.",
      "This Policy forms part of the INDANGA Terms & Conditions and shall be read together with the applicable Listing terms, Provider Rules, Complaint & Dispute Resolution Procedure, and other transaction-specific terms published or incorporated into the Platform.",
      "The Policy is intended to operate in accordance with applicable laws and regulatory requirements of the Republic of Rwanda, including Law No. 36/2012 of 21 September 2012 relating to Competition and Consumer Protection, Law No. 058/2021 of 13 October 2021 relating to the Protection of Personal Data and Privacy, Law No. 017/2021 of 3 March 2021 relating to Financial Service Consumer Protection, and applicable payment-system legislation and regulatory requirements. The applicable legal framework may change, and this Policy shall be interpreted subject to mandatory provisions of law.",
    ],
  },
  {
    title: "Scope and Disclosed Conditions",
    paragraphs: [
      "This Policy applies to customers, Providers, and authorised agents or commissioners participating in transactions through INDANGA. A Listing may contain additional cancellation, deposit, booking, or non-refundability conditions. Where a Listing-specific condition has been clearly disclosed to the customer before the transaction is concluded, that condition forms part of the applicable transaction terms, subject always to applicable law and this Policy.",
    ],
  },
  {
    title: "Key Principles and Platform Status",
    bullets: [
      "Refund eligibility depends on the reason for cancellation, the applicable transaction terms, the status of the service, the conduct of the parties, payment status, and applicable law.",
      "Indanga does not guarantee that every cancellation will result in a full refund.",
      "An approved refund may take time to reach the customer because the reversal or credit is processed through the applicable payment channel, payment provider, bank, card issuer, mobile-money operator, or other financial institution.",
      "The Payment Risk Reserve or Rolling Reserve described in this Policy is a payment-provider risk mechanism and must not be represented to customers as an Indanga refund fee.",
    ],
  },
  {
    title: "Customer Cancellation Mechanics",
    paragraphs: [
      "A customer should submit a cancellation request through the available INDANGA channel as soon as the need for cancellation arises. The customer should provide the transaction reference and sufficient information to identify the relevant booking, purchase, reservation, or service. Cancellation eligibility and any refund will be assessed against the applicable Listing conditions, transaction terms, and this Policy.",
    ],
  },
  {
    title: "Provider Obligations and Unjustified Cancellations",
    paragraphs: [
      "A Provider should not cancel a confirmed transaction without a legitimate contractual, operational, or other lawful reason. Where a Provider cancels a confirmed transaction without a valid basis, Indanga may investigate the circumstances and determine the appropriate customer remedy under the applicable transaction terms. Repeated unjustified Provider cancellations may result in Listing restrictions, suspension, or other measures under the Provider Rules.",
    ],
  },
  {
    title: "Circumstances That May Support a Full Refund",
    paragraphs: [
      "Subject to verification, the applicable transaction terms, and applicable law, a full refund may be considered where:",
    ],
    bullets: [
      "the service or Listing was materially unavailable when the Provider was required to provide it;",
      "a Provider materially failed to deliver the service described in the applicable transaction terms;",
      "the transaction was duplicated due to a confirmed Platform or payment-processing error; or",
      "another circumstance expressly covered by the applicable transaction terms requires a full refund.",
    ],
    closingParagraphs: [
      "A full refund is not automatic merely because a customer changes their mind, fails to attend or use a service, or cancels after a stated cancellation deadline, unless the applicable transaction terms or mandatory law provide otherwise.",
    ],
  },
  {
    title: "Circumstances That May Result in a Partial or No Refund",
    paragraphs: [
      "A refund may be reduced or declined where the customer cancels outside the permitted cancellation period, fails to attend or use a service without an eligible reason, materially breaches the transaction conditions, provides materially false or misleading information, or where the Listing's disclosed cancellation terms permit a deduction.",
      "Operational Error Treatment. Where a loss or cancellation results from circumstances attributable to Indanga, the applicable remedy will be determined having regard to the transaction, the nature and impact of the error, applicable contractual obligations, and applicable law. A full refund is not presumed solely because an Indanga-related error or operational issue occurred. Nothing in this section limits, excludes, or waives a mandatory consumer right or remedy that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Fraud, Unauthorized Payments and Illegal Activity",
    paragraphs: [
      "Transactions suspected of involving stolen cards, unauthorized payment-method use, fraud, money laundering, unlawful activity, or other prohibited conduct may be placed under review. Indanga may delay a refund or settlement where reasonably necessary to verify the transaction, cooperate with a Payment Provider, financial institution, payment scheme, or competent authority, or prevent an improper payment from being returned to an unauthorized person.",
      "Where a customer reports suspected fraud or unauthorized use of a payment method, the customer should also promptly notify the relevant bank, card issuer, or payment institution. Indanga may provide transaction records and relevant information to authorised payment, regulatory, or law-enforcement bodies where legally required or otherwise lawfully permitted.",
    ],
  },
  {
    title: "Payment Risk Reserve / 10% Rolling Reserve",
    paragraphs: [
      "The integrated payment arrangement may include a Payment Risk Reserve or Rolling Reserve held by the applicable Payment Provider. Under the current ITEC agreement referenced by Indanga, the rolling reserve is stated as 10% of transactions and is held for a 180-day period, subject to the contractual conditions governing its use and release.",
      "The 10% reserve is not an Indanga refund fee and is not an additional 10% amount charged by Indanga to the customer. It is a payment-provider risk mechanism and may be applied or retained in accordance with the applicable payment arrangement for qualifying payment-related liabilities, including eligible refunds, chargebacks, fraudulent or unauthorized transactions, and applicable fees or fines. Where no qualifying liability requires application of the reserve, the amount is released in accordance with the applicable payment-provider settlement procedures. The existence of the reserve does not mean that a customer automatically loses 10% of an approved refund.",
    ],
  },
  {
    title: "Refund Processing Through the Payment Gateway",
    paragraphs: [
      "Where Indanga approves a refund, the refund will normally be initiated through the applicable payment channel or Payment Provider process. Indanga may be unable to control the exact time at which a Payment Provider, card issuer, mobile-money operator, bank, payment network, or other financial institution credits the customer's account. A refund may therefore remain pending after Indanga has approved or initiated it. Customers should retain their transaction reference and payment confirmation until the refund is completed.",
    ],
  },
  {
    title: "Chargebacks and Payment Dispute Procedures",
    paragraphs: [
      "A chargeback is a payment dispute initiated through a financial institution, issuing bank, payment scheme, or other applicable payment mechanism. Customers are encouraged to use the INDANGA complaint and refund process where appropriate before initiating a chargeback; however, this does not remove or restrict any lawful right to contact a financial institution or payment provider.",
      "Where a chargeback has been initiated, Indanga may suspend parallel refund processing until the payment status is clarified, in order to avoid duplicate recovery or payment. Indanga may request evidence from the Provider and provide relevant evidence to the Payment Provider or other authorised party.",
    ],
  },
  {
    title: "Duplicate Refunds and Overpayments",
    paragraphs: [
      "A customer must not knowingly retain duplicate refunds or amounts returned in error. If Indanga or a Payment Provider mistakenly returns more than the amount properly due, Indanga may request repayment or, where lawful, apply the excess amount against a future amount properly payable by the customer.",
    ],
  },
  {
    title: "Refund Decision Process",
    paragraphs: [
      "Indanga may assess a refund request using relevant information, including:",
    ],
    bullets: [
      "transaction reference;",
      "Listing and transaction terms;",
      "cancellation date and time;",
      "payment and settlement status;",
      "communications between the parties;",
      "evidence of service delivery or non-delivery;",
      "Provider response;",
      "photographs, documents, or other relevant evidence;",
      "fraud, security, or payment-risk information; and",
      "applicable Payment Provider information.",
    ],
    closingParagraphs: [
      "Where evidence is incomplete or contradictory, Indanga may request additional information before reaching a decision. Indanga may escalate payment-fraud or chargeback matters to the Payment Provider, financial institution, or other competent party.",
    ],
  },
  {
    title: "Refund Timelines",
    paragraphs: [
      "Indanga will seek to process eligible refunds within a reasonable operational period after approval and verification. The actual time for funds to appear in the customer's account may depend on the payment channel, Payment Provider, bank, card issuer, mobile-money operator, payment network, and other financial institutions involved. Where a refund is delayed because of an external payment-processing or settlement process, Indanga may provide the available transaction reference or status information to the customer.",
    ],
  },
  {
    title: "Provider Cooperation",
    paragraphs: [
      "Providers must cooperate with refund investigations and provide requested evidence within the time reasonably specified by Indanga. Failure to cooperate may affect the determination of the Provider's entitlement to settlement and may result in temporary restrictions. Providers must not pressure customers to withdraw legitimate complaints or misrepresent the status of a refund.",
    ],
  },
  {
    title: "Non-Refundable or Restricted Transactions",
    paragraphs: [
      "Where a Listing clearly states that a booking, deposit, service, or transaction is non-refundable or subject to a specific cancellation charge, that condition may apply, provided that it was accurately disclosed before the transaction and is consistent with applicable law. Indanga will not use a non-refundable label to defeat a mandatory legal right or remedy expressly available under applicable law.",
    ],
  },
  {
    title: "Payment Fees and Deductions",
    paragraphs: [
      "Any transaction fee, service fee, commission, tax, Payment Provider charge, or other deduction applicable to a transaction should be disclosed through the relevant transaction flow where required by applicable law or the transaction terms. The 10% Payment Risk Reserve described in this Policy is not an Indanga refund fee. Where a Payment Provider charge applies to a refund or reversal, its treatment will depend on the applicable payment arrangement, the transaction terms, and applicable law.",
    ],
  },
  {
    title: "Refund Decision and Review",
    paragraphs: [
      "Indanga will communicate the outcome of a refund request where reasonably practicable. Where a customer disagrees with the decision, the customer may use the applicable Complaint & Dispute Resolution Procedure. Payment-network, bank, card-issuer, mobile-money, or other financial-institution dispute mechanisms may also apply to payment-specific disputes.",
    ],
  },
  {
    title: "Abuse of Refund or Cancellation Procedures",
    paragraphs: [
      "Users must not submit false refund claims, fabricate service failures, manipulate transaction evidence, use stolen payment credentials, deliberately abuse chargeback procedures, or otherwise attempt to obtain funds to which they are not entitled. Where misuse or fraud is reasonably suspected, Indanga may suspend accounts, restrict transactions, withhold or review settlement to the extent permitted by applicable law and contractual terms, and provide relevant information to authorised parties.",
    ],
  },
  {
    title: "Force Majeure and Exceptional Events",
    paragraphs: [
      "Where cancellation results from an event beyond the reasonable control of the relevant party, the available refund or alternative remedy will depend on the Listing terms, the circumstances, applicable law, and the practical availability of the service. Indanga may facilitate communication between the parties and apply any applicable emergency or exceptional transaction rules.",
    ],
  },
  {
    title: "Changes to this Policy",
    paragraphs: [
      "Indanga may update this Policy to reflect changes in its services, Listings, payment infrastructure, applicable law, risk controls, or operational procedures. The version published on the Platform shall identify the applicable effective date and version number. Changes will not be applied in a manner that unlawfully removes mandatory rights already accrued by a customer.",
    ],
  },
  {
    title: "Contact Information",
    paragraphs: [
      "Indanga Company Ltd",
      "Platform: INDANGA - www.indanga.com",
      "Refund / Customer Support: info@indanga.com",
      "Additional Authorised Contact: ntakishunter@gmail.com",
    ],
  },
];

export default function RefundCancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <article className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to INDANGA
        </Link>

        <header className="mt-8 border-b border-border pb-6 sm:mt-12">
          <p className="text-sm font-semibold uppercase text-primary">IND-LGL-002 | Version 1.0</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            This Policy applies to customers, Providers, and authorised agents or commissioners
            participating in transactions through INDANGA. Listing-specific terms may also apply.
          </p>
        </header>

        <div className="divide-y divide-border">
          {policySections.map((section, index) => (
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
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
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
      </article>
    </main>
  );
}