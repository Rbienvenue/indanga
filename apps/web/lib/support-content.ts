import {
  Briefcase,
  Building2,
  CreditCard,
  House,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  Siren,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SupportArea = {
  icon: LucideIcon;
  title: string;
  description: string;
  items: string[];
};

export const supportAreas: SupportArea[] = [
  {
    icon: House,
    title: "Booking & reservations",
    description:
      "Check a booking, request a change, understand confirmation, or get help before your stay or rental.",
    items: [
      "How do I book a home, hotel, or car?",
      "Is my booking confirmed?",
      "What happens after I send a booking request?",
      "How do I change my dates or guest details?",
      "Where can I find my booking reference?",
      "What should I do if the provider does not respond?",
      "What should I do if the property or car is unavailable?",
    ],
  },
  {
    icon: CreditCard,
    title: "Prices & payments",
    description:
      "Understand the listed price, additional charges, deposits, payment status, and receipts.",
    items: [
      "What is included in the listed price?",
      "Are taxes or service fees included?",
      "Why does the final price differ from the listing price?",
      "Is a deposit required?",
      "When do I pay?",
      "How do I know whether my payment was successful?",
      "Where can I find my receipt?",
      "What should I do if I was charged twice?",
      "What should I do if I do not recognize a payment?",
    ],
  },
  {
    icon: ReceiptText,
    title: "Cancellations & refunds",
    description:
      "Find the cancellation deadline, understand refund eligibility, and track a refund request.",
    items: [
      "How do I cancel a booking?",
      "Will I receive a full refund?",
      "What if the provider cancels?",
      "How long does a refund take?",
      "Can I change my booking instead of cancelling?",
      "What happens if I do not show up?",
      "What if the listing was unavailable or substantially different?",
      "How do I submit a refund request?",
    ],
  },
  {
    icon: Building2,
    title: "Listings & verification",
    description:
      "Understand listing badges, report inaccurate information, or ask for a review of a property, hotel, or vehicle.",
    items: [
      "What does “Reviewed by INDANGA” mean?",
      "What does “Verified by INDANGA” mean?",
      "How often is listing information checked?",
      "How can I report a wrong price or unavailable listing?",
      "How do I report misleading photos or information?",
      "How do I report a suspicious provider?",
      "Can I request a property or car to be reviewed?",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety & trust",
    description: "Learn how to protect your account, payment, and personal information.",
    items: [
      "How do I stay safe when contacting a provider?",
      "Should I pay outside INDANGA?",
      "How do I report a suspicious payment request?",
      "What should I do if a provider asks me to hide a payment?",
      "How do I report harassment, fraud, or unsafe behaviour?",
      "What information should I include in a safety report?",
    ],
  },
  {
    icon: UserRound,
    title: "Account & profile",
    description: "Manage sign-in, contact details, saved listings, and account security.",
    items: [
      "How do I create an account?",
      "I cannot sign in. What should I do?",
      "How do I reset my password?",
      "How do I update my phone number or email?",
      "How do I delete my account?",
      "How do I manage saved listings?",
      "How does INDANGA use my personal information?",
    ],
  },
  {
    icon: Briefcase,
    title: "For providers",
    description:
      "Get help listing a property, hotel room, or vehicle and managing enquiries and bookings.",
    items: [
      "How do I become a provider?",
      "What information is required to create a listing?",
      "What documents may be needed for verification?",
      "How do I update price and availability?",
      "How do I respond to a booking request?",
      "When do providers receive settlement?",
      "What fees or commissions apply?",
      "What happens if a customer reports a listing?",
    ],
  },
];

export type SupportChannel = {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
  description: string;
};

export const supportChannels: SupportChannel[] = [
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
    value: "+250 788 765 547",
    href: "tel:+250788765547",
    description: "Available Monday to Saturday, 8:00 AM - 6:00 PM.",
  },
  {
    icon: Siren,
    title: "Urgent booking help",
    value: "Include your booking reference",
    href: "mailto:support@indanga.com?subject=Urgent%20booking%20help",
    description: "For urgent booking or payment issues.",
  },
];

export const fraudWarning =
  "Never share your password, one-time code, or full payment-card number with anyone. If you suspect fraud or an unauthorised payment, contact your bank or payment provider immediately as well as INDANGA support.";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "how-to-book",
    question: "How do I book a property, hotel, or car?",
    answer:
      "Choose Homes, Hotels, or Cars, enter your search details, and open a listing that suits your needs. Review the photos, location, price, availability, provider information, and cancellation terms. Select the booking action shown on the listing. Your booking is confirmed only when the confirmation message or booking reference is issued.",
  },
  {
    id: "booking-confirmed",
    question: "Is my booking confirmed when I click the booking button?",
    answer:
      "Not always. Some listings can be confirmed immediately, while others require the provider to confirm availability and the final price. The page will tell you whether you are making a booking, sending a request, or checking availability.",
  },
  {
    id: "after-booking-request",
    question: "What happens after I send a booking request?",
    answer:
      "We send the request to the provider and keep you updated. Your booking is not confirmed until availability and the final price have been confirmed. Keep your booking reference for follow-up questions.",
  },
  {
    id: "provider-no-response",
    question: "What if the provider does not respond?",
    answer:
      "Contact INDANGA support with the listing link or booking reference. We will follow up with the provider and help you look for another option if necessary.",
  },
  {
    id: "listed-price-includes",
    question: "What does the listed price include?",
    answer:
      "The listing price is the provider's stated rate for the period shown. Depending on the listing, additional charges may include taxes, service fees, deposits, delivery or pickup fees, cleaning fees, insurance, utilities, or other disclosed costs. Review the price summary before confirming.",
  },
  {
    id: "final-price-differs",
    question: "Why does the final price differ from the listing price?",
    answer:
      "The final price can change when you select dates, duration, room type, vehicle options, number of guests, delivery, or other services. Any known additional charges should appear in the price summary before you pay or confirm.",
  },
  {
    id: "deposit-required",
    question: "Is a deposit required?",
    answer:
      "Some homes, hotels, and vehicles require a deposit. The amount, purpose, refund conditions, and refund timing should be shown before confirmation. If the deposit is not shown, ask the provider or contact INDANGA support before paying.",
  },
  {
    id: "when-to-pay",
    question: "When do I pay?",
    answer:
      "Payment timing depends on the listing and booking process. Do not send money through an unverified link or personal account. Follow the payment instructions shown through INDANGA or confirmed by the authorised provider.",
  },
  {
    id: "charged-twice",
    question: "What should I do if I was charged twice?",
    answer:
      "Contact support@indanga.com immediately and include your booking reference, payment confirmation, amount, date, and payment method. Do not submit multiple refund requests for the same charge while the first request is under review.",
  },
  {
    id: "how-to-cancel",
    question: "How do I cancel a booking?",
    answer:
      "Open your booking or contact INDANGA support with your booking reference. Submit the cancellation request as soon as possible. Eligibility depends on the listing terms, cancellation time, booking status, payment status, and applicable law.",
  },
  {
    id: "full-refund",
    question: "Will I receive a full refund?",
    answer:
      "A full refund is not automatic. It may be available when the service is materially unavailable, the provider fails to deliver the confirmed service, the same payment was duplicated because of a confirmed platform error, or the applicable listing terms provide for it. Review the specific cancellation terms before booking.",
  },
  {
    id: "refund-time",
    question: "How long does a refund take?",
    answer:
      "After INDANGA approves or initiates a refund, the payment provider, bank, card issuer, or mobile-money operator may need additional time to process it. Keep your transaction reference until the refund reaches your account.",
  },
  {
    id: "provider-cancels",
    question: "What if the provider cancels?",
    answer:
      "Contact support as soon as you receive the cancellation notice. INDANGA will review the transaction terms and help identify the available refund or alternative remedy.",
  },
  {
    id: "reviewed-meaning",
    question: "What does “Reviewed by INDANGA” mean?",
    answer:
      "We checked the information submitted by the provider before publishing the listing. Prices, availability, and conditions can change, so review the latest details before booking or paying.",
  },
  {
    id: "verified-meaning",
    question: "What does “Verified by INDANGA” mean?",
    answer:
      "INDANGA has completed the checks described beside the listing, which may include provider identity, location, photos, pricing, and availability. Verification does not guarantee future availability or replace your review of the booking terms.",
  },
  {
    id: "pay-outside",
    question: "Should I pay outside INDANGA?",
    answer:
      "Do not pay through an unverified link or personal account. Use the payment process shown on the platform or confirm the payment instructions with INDANGA support first. Report any request to hide or bypass the official process.",
  },
  {
    id: "report-listing",
    question: "How do I report a suspicious listing?",
    answer:
      "Use Report this listing on the listing page or email support@indanga.com with the listing link, your booking reference if applicable, and a description of the concern. Do not send payment while the report is being reviewed.",
  },
  {
    id: "become-provider",
    question: "How do I list a property, hotel, or car?",
    answer:
      "Select Become a provider and create an account. Provide accurate photos, location, pricing, availability, amenities or vehicle details, contact information, and any documents requested for review. Keep your listing current after publication.",
  },
  {
    id: "listing-review",
    question: "What happens during listing review?",
    answer:
      "INDANGA reviews the information submitted by the provider and may request clarification or supporting documents. A listing may be approved, returned for changes, temporarily hidden, or removed if the information cannot be confirmed or violates the platform rules.",
  },
  {
    id: "provider-update-price",
    question: "How do providers update prices and availability?",
    answer:
      "Sign in to your provider account, open the relevant listing, and update the price, availability, photos, amenities, or terms. Changes should be saved before accepting a booking request.",
  },
  {
    id: "how-data-used",
    question: "How does INDANGA use my information?",
    answer:
      "INDANGA may use account, booking, payment, verification, support, and technical information to operate the platform, process transactions, prevent fraud, resolve complaints, and comply with the law. Review the Terms and Conditions for details and contact information.",
  },
  {
    id: "cannot-sign-in",
    question: "I cannot sign in. What should I do?",
    answer:
      "Check your email or phone number, request a password reset, and try again. If the problem continues, contact support@indanga.com and include the email or phone number linked to your account. Do not send your password.",
  },
];

export const mostAskedFaqIds = [
  "booking-confirmed",
  "reviewed-meaning",
  "refund-time",
  "pay-outside",
];

export type QuickResource = {
  label: string;
  href: string;
};

export const quickResources: QuickResource[] = [
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Refund & Cancellation Policy", href: "/refund-cancellation-policy" },
  { label: "Booking & cancellation FAQs", href: "/support#faqs" },
  { label: "Listing verification FAQs", href: "/support#faq-verified-meaning" },
  { label: "Safety guidance FAQs", href: "/support#faq-pay-outside" },
  { label: "About INDANGA", href: "/about" },
];
