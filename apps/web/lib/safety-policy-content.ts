export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
};

export const safetyPolicyMeta = {
  documentId: "IND-POL-001",
  version: "1.0",
  effectiveDate: "2 October 2026",
  lastUpdated: "2 October 2026",
  title: "Safety and Verification Policy",
};

export const safetyPolicySections: PolicySection[] = [
  {
    title: "Purpose",
    paragraphs: [
      "This Policy explains how INDANGA reviews listings, communicates verification status, supports safer transactions, and handles reports of inaccurate, suspicious, or unsafe activity.",
      "INDANGA COMPANY LTD (Company Code/TIN 156790062), registered in Rwanda on 10 August 2026, operates a marketplace platform. Providers are responsible for the legality, accuracy, availability, and delivery of the property, accommodation, vehicle, or service they offer. Customers must review details, prices, and terms before booking or paying.",
    ],
  },
  {
    title: "Review statuses",
    paragraphs: [
      "A Reviewed by INDANGA status means that INDANGA has reviewed information submitted by the provider before publication. The review may cover the provider's contact information, listing description, photographs, location, pricing, availability, and other relevant information. The listing should display the review date: Reviewed on the date shown on the listing.",
      "A Verified by INDANGA status may be used only when INDANGA has completed the configured checks for that listing category. The checks may include provider identity, authority to offer the listing, location, photos, pricing, availability, and supporting documents. The listing should display: Verified on the date shown on the listing.",
      "The Platform team must keep an internal record of what was checked, by whom, when, and what evidence supported the status.",
    ],
    bullets: [
      "Verification pending: This listing has been submitted for review. Confirm the details and do not send payment until the provider and booking terms have been confirmed through INDANGA.",
      "Information not yet verified: This listing is available for enquiry, but INDANGA has not completed all verification checks. Review the details carefully before proceeding.",
      "Verification helps users assess listing information. It does not guarantee future availability, unchanged pricing, or the quality of every service.",
    ],
    closingParagraphs: [
      "This is a drafting template, not legal advice. Have Rwanda counsel review it and confirm that every verification step described here is actually performed before publishing it.",
    ],
  },
  {
    title: "What verification does not mean",
    paragraphs: ["Verification does not mean that:"],
    bullets: [
      "the listing will remain available;",
      "the price will never change;",
      "the provider will never cancel;",
      "every service feature will be available at every time;",
      "the property or vehicle is risk-free;",
      "INDANGA owns or operates the property, hotel, vehicle, or service; or",
      "a customer can skip their own review of the booking terms.",
    ],
  },
  {
    title: "Provider review process",
    paragraphs: [
      "INDANGA may request information reasonably needed to review a provider or listing, including:",
    ],
    bullets: [
      "legal name and contact details;",
      "identity or business information;",
      "authority to list the property, accommodation, vehicle, or service;",
      "location and address information;",
      "photographs and descriptive information;",
      "pricing, deposits, availability, and cancellation conditions;",
      "permits, licences, ownership evidence, or other documents where relevant; and",
      "information needed to investigate a complaint or payment concern.",
    ],
    closingParagraphs: [
      "A listing may be approved, returned for correction, marked as pending, restricted, hidden, or removed. The decision may depend on risk, completeness, accuracy, legal requirements, user reports, and the provider's cooperation.",
    ],
  },
  {
    title: "Ongoing accuracy",
    paragraphs: [
      "Providers must keep their listings current. They must promptly update price, availability, photos, amenities, location, restrictions, contact details, and cancellation terms. Customers can report information that appears incorrect or out of date. INDANGA may contact the provider, request evidence, pause the listing, correct the information, or remove the listing.",
    ],
  },
  {
    title: "Safety rules for customers",
    paragraphs: ["Customers should:"],
    bullets: [
      "communicate through the Platform where possible;",
      "check the listing, provider, price, dates, deposit, and cancellation terms;",
      "keep booking references, payment confirmations, and messages;",
      "meet or visit only in a safe and lawful manner;",
      "tell a trusted person about an in-person viewing or pickup when appropriate; and",
      "contact INDANGA support when a request appears unusual or unsafe.",
    ],
    closingParagraphs: [
      "Do not send a password or one-time security code.",
      "Do not send full payment-card details through email or a support form.",
      "Do not pay through an unverified link or personal account.",
      "Do not allow a provider to pressure you into hiding a payment or bypassing the official process.",
      "Do not continue a transaction that appears fraudulent or unsafe.",
    ],
  },
  {
    title: "Reporting",
    paragraphs: ["A customer or provider can report:"],
    bullets: [
      "an incorrect or suspicious price;",
      "an unavailable or duplicate listing;",
      "misleading photographs or descriptions;",
      "an impersonating or unauthorised provider;",
      "a suspicious payment request;",
      "harassment, threats, discrimination, or unsafe behaviour;",
      "a privacy or account-security concern; or",
      "a confirmed service that was materially different from the listing.",
    ],
    closingParagraphs: [
      "Report through the listing's Report this listing action or email support@indanga.com with the listing URL, booking reference, description, date, and available evidence. In an emergency, contact the relevant public emergency service first.",
    ],
  },
  {
    title: "Complaint handling",
    paragraphs: [
      "INDANGA may request reasonable evidence, including booking details, messages, payment records, photographs, documents, and provider responses. We may restrict a listing or account while investigating a serious risk.",
      "INDANGA targets acknowledgement of a support request within one business day and an initial response within three business days, subject to the complexity of the issue, evidence required, weekends, public holidays, payment-provider review, and emergency or regulatory escalation. These are service targets, not a guarantee of resolution.",
    ],
  },
  {
    title: "Payment safety",
    paragraphs: [
      "Do not send money through an unverified link or personal account. Keep your booking details and receipts. Report suspicious activity to support@indanga.com.",
      "Where payments are enabled, use only the payment flow displayed by INDANGA or the authorised payment provider. A provider must not direct a customer to an unapproved payment channel in order to avoid a fee, record, review, or safety measure.",
      "If a customer suspects unauthorised payment use, they should contact INDANGA support and their bank, card issuer, or mobile-money provider immediately.",
    ],
  },
  {
    title: "Account and personal-data safety",
    paragraphs: [
      "INDANGA will process personal data according to its Privacy Policy. Users should provide only information needed for the relevant account, listing, booking, payment, verification, or support purpose.",
      "Indanga should maintain appropriate technical and organisational safeguards, keep records of processing, and operate a breach-response procedure. Rwanda's data-protection framework includes requirements concerning information provided at collection, security measures, cross-border transfers, data-protection officers, and breach notifications.",
    ],
  },
  {
    title: "Provider safety duties",
    paragraphs: ["Providers must:"],
    bullets: [
      "have the right or authority to list what they offer;",
      "maintain safe and lawful premises, vehicles, and services;",
      "provide accurate photos and descriptions;",
      "disclose material restrictions and risks;",
      "protect customer information;",
      "comply with applicable health, safety, licensing, tax, consumer, and sector rules; and",
      "cooperate with reports, investigations, and refund or payment reviews.",
    ],
  },
  {
    title: "Enforcement",
    paragraphs: [
      "INDANGA may warn, correct, limit, pause, hide, suspend, or remove a listing or account. Serious conduct may be reported to payment providers, regulators, law enforcement, or other competent authorities where permitted or required by law.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Safety reports: support@indanga.com",
      "Phone: +250 788 765 547",
      "Location: Kigali, Rwanda",
    ],
  },
  {
    title: "Related documents",
    bullets: [
      "Terms of Use",
      "Prices and Fees",
      "Refund and Cancellation Policy",
      "Provider Agreement",
      "Privacy Policy",
    ],
  },
];

export const safetyPolicyReferences = [
  { label: "Rwanda Information Society Authority: Data Protection and Privacy Law" },
  { label: "Rwanda Law No. 058/2021 Relating to the Protection of Personal Data and Privacy" },
  { label: "Rwanda Inspectorate, Competition and Consumer Protection Authority: Laws" },
];
