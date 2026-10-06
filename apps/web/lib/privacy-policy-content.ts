export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
};

export const privacyPolicyMeta = {
  documentId: "IND-POL-002",
  version: "1.0",
  effectiveDate: "6 October 2026",
  lastUpdated: "6 October 2026",
  title: "Privacy Policy",
};

export const privacyPolicySections: PolicySection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "This Privacy Policy explains what personal information INDANGA collects, why it is collected, how it is used and shared, and the choices you have. It applies to the INDANGA website, accounts, listings, booking tools, payment features, support channels, and related services (together, the Platform).",
      "INDANGA is operated by Indanga Company Ltd (Company Code/TIN 156790062), registered in Rwanda on 10 August 2026, with its office in Kigali, Rwanda. Where data-protection law applies, Indanga Company Ltd is responsible for personal information processed through the Platform.",
      "This Policy should be read together with the Terms of Use, Safety and Verification Policy, and Refund and Cancellation Policy.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: [
      "We collect only information needed for the relevant account, listing, booking, payment, verification, or support purpose:",
      "Information may be provided directly by you, generated when you use the Platform, or received from another user as part of a booking, verification, or report. We will explain the purpose and any other information required by applicable law when information is collected.",
    ],
    bullets: [
      "Account information: your name, email address, phone number, password (stored in hashed form by our authentication library, never in plain text), profile image where provided, and account role.",
      "Identity and verification information: national ID where required, submitted identity documents and their file details, verification status, and review records.",
      "Listing information: property, accommodation, or vehicle photos, location and address, pricing, availability, amenities, restrictions, and provider contact details.",
      "Booking and payment information: booking dates and details, amounts and service fees, payment method, and transaction or booking references. Full payment-card numbers are processed by the payment provider and are never requested through support forms or email.",
      "Support and report information: messages you send to support, reported listings, booking references, and evidence you provide.",
      "Technical information: sign-in sessions, IP address and device information recorded with sessions, one-time security codes used for verification, and basic operational records needed to run and secure the Platform.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "INDANGA may use account, booking, payment, verification, support, and technical information to:",
    ],
    bullets: [
      "create and manage accounts, sign-ins, and sessions;",
      "display listings and enable enquiries, bookings, and payments;",
      "review providers and listings and communicate verification status;",
      "process transactions, receipts, refunds, and settlements;",
      "provide customer support and handle reports, complaints, and disputes;",
      "prevent fraud, misuse, and unsafe activity and enforce platform rules; and",
      "comply with applicable law, including tax, consumer-protection, and data-protection obligations.",
    ],
  },
  {
    title: "Legal grounds for processing",
    paragraphs: [
      "Where required by applicable data-protection law, INDANGA processes personal information on a lawful basis. Depending on the information and purpose, this may include providing an account or requested booking service, complying with a legal obligation, protecting users and the Platform from fraud or safety risks, or your consent where consent is required. If processing is based on consent, you may withdraw it; this does not affect processing that took place before withdrawal or processing supported by another lawful basis.",
    ],
  },
  {
    title: "Sharing of information",
    paragraphs: [
      "We do not sell your personal information. Information is shared only as needed to operate the Platform:",
    ],
    bullets: [
      "with providers and customers as needed to fulfil a booking or enquiry you participate in (for example, booking details shared with the relevant provider);",
      "with the payment provider to authorise, settle, review, or refund a transaction;",
      "with infrastructure providers that store or transmit data on our behalf, such as our database hosting, file storage for listing media and verification documents, and transactional email delivery;",
      "with regulators, law enforcement, payment providers, or other competent authorities where permitted or required by law, including to investigate fraud, security incidents, or unlawful activity; and",
      "with your consent or at your direction, for example when you ask us to share information with your bank or payment provider.",
    ],
  },
  {
    title: "International processing",
    paragraphs: [
      "Some service providers may store or process personal information outside Rwanda. Where information is transferred across borders, INDANGA will make the transfer only as permitted by applicable law and will apply the safeguards required for that transfer. Contact support@indanga.com to ask about international processing relevant to your information.",
    ],
  },
  {
    title: "Cookies and sessions",
    paragraphs: [
      "INDANGA uses sign-in session records and browser storage or cookies as needed to keep you signed in, remember security and preference choices, and protect accounts against misuse. Session records may include expiry, IP address, and device information.",
      "You can clear browser storage or sign out to end a session, but parts of the Platform that require an account will not work without an active session. We do not use advertising trackers on the Platform.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "INDANGA uses appropriate technical and organisational safeguards to protect personal information, including hashed password storage, authenticated access to accounts and documents, and limited internal access to verification and payment records. INDANGA keeps records of processing and operates a breach-response procedure. If a personal-data breach occurs, INDANGA will assess it and provide notifications to the competent authority and affected people where and as required by law.",
      "No system is completely secure. You should keep login details confidential, never share passwords or one-time security codes, and report suspected unauthorised access to support@indanga.com promptly.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Personal information is kept while your account is active and for as long as needed for the purpose it was collected for, including operating the Platform, resolving disputes, preventing fraud, and complying with legal and accounting obligations.",
      "Verification documents, transaction records, and support correspondence may be retained after an account is closed where required by law or needed for pending complaints, disputes, or investigations. Where information is no longer needed, it is deleted or anonymised.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Subject to Rwanda Law No. 058/2021 of 13 October 2021 relating to the Protection of Personal Data and Privacy and other applicable law, you may:",
    ],
    bullets: [
      "request access to the personal information INDANGA holds about you;",
      "request correction of inaccurate or incomplete information, including through your account profile;",
      "request deletion of your account and personal information where there is no overriding legal or operational reason to keep it;",
      "withdraw consent where processing is based on consent; and",
      "object to or request restriction of certain processing where those rights apply; and",
      "raise a complaint with INDANGA or the competent data-protection authority about how your information is handled.",
    ],
    closingParagraphs: [
      "These rights are subject to applicable law and may be limited in some circumstances. To exercise them, contact support@indanga.com with the email or phone number linked to your account. Do not send your password or full payment-card details. INDANGA may request information needed to confirm your identity and will explain if a request cannot be fulfilled.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "The Platform requires users to have the legal capacity to enter into the relevant transaction. INDANGA does not knowingly collect personal information from children. If you believe a child has provided personal information, contact support@indanga.com so it can be reviewed and removed.",
    ],
  },
  {
    title: "Changes to this Policy",
    paragraphs: [
      "INDANGA may update this Policy to reflect changes in the Platform, law, payment arrangements, or risk controls. The updated version will show its effective and last-updated dates. Material changes will be applied in accordance with applicable law.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Privacy and data questions: support@indanga.com",
      "General enquiries: info@indanga.com",
      "Phone: +250 788 765 547 (Monday to Saturday, 8:00 AM - 6:00 PM)",
      "Location: Kigali, Rwanda",
    ],
  },
  {
    title: "Related documents",
    bullets: [
      "Terms of Use",
      "Safety and Verification Policy",
      "Refund and Cancellation Policy",
      "Provider Agreement",
      "Prices and Fees",
    ],
  },
];

export const privacyPolicyReferences = [
  {
    label:
      "Rwanda Law No. 058/2021 of 13 October 2021 Relating to the Protection of Personal Data and Privacy",
  },
  { label: "Rwanda Information Society Authority: Data Protection and Privacy Law" },
  { label: "Rwanda Inspectorate, Competition and Consumer Protection Authority: Laws" },
];
