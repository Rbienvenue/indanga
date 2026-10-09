import { jsPDF } from "jspdf";
import { readFileSync } from "node:fs";
import type { Receipt } from "./receipts.service";

const regular = readFileSync(
  new URL("./assets/SpaceGrotesk-Regular.ttf", import.meta.url),
).toString("base64");
const bold = readFileSync(new URL("./assets/SpaceGrotesk-Bold.ttf", import.meta.url)).toString(
  "base64",
);
const logo = readFileSync(new URL("./assets/indanga.png", import.meta.url)).toString("base64");
const money = (value: number) => `RWF ${value.toLocaleString("en-US")}`;

export function generateReceiptPdf(receipt: Receipt): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("SpaceGrotesk-Regular.ttf", regular);
  doc.addFont("SpaceGrotesk-Regular.ttf", "SpaceGrotesk", "normal");
  doc.addFileToVFS("SpaceGrotesk-Bold.ttf", bold);
  doc.addFont("SpaceGrotesk-Bold.ttf", "SpaceGrotesk", "bold");
  const left = 18,
    right = 192;
  const line = (y: number) => {
    doc.setDrawColor(225, 225, 225);
    doc.line(left, y, right, y);
  };
  const text = (
    value: string,
    x: number,
    y: number,
    size = 9,
    weight: "normal" | "bold" = "normal",
    align: "left" | "right" = "left",
  ) => {
    doc.setFont("SpaceGrotesk", weight);
    doc.setFontSize(size);
    doc.setTextColor(23, 23, 23);
    doc.text(value, x, y, { align });
  };
  const image = doc.getImageProperties(`data:image/png;base64,${logo}`);
  doc.addImage(
    `data:image/png;base64,${logo}`,
    "PNG",
    left,
    18,
    (22 * image.width) / image.height,
    22,
  );
  text("support@indanga.com", left, 44);
  text("+250 788 765 547", left, 50);
  text("PAYMENT RECEIPT", right, 24, 16, "bold", "right");
  text(receipt.id, right, 31, 8, "normal", "right");
  text("PAID", right, 38, 9, "bold", "right");
  line(56);
  text("RECEIVED FROM", left, 65, 8, "bold");
  text("PAYMENT DETAILS", right, 65, 8, "bold", "right");
  const customerLines = doc.splitTextToSize(receipt.customer.name, 82) as string[];
  text(customerLines.join("\n"), left, 72, 10, "bold");
  let y = 72 + customerLines.length * 5;
  const emailLines = doc.splitTextToSize(receipt.customer.email, 82) as string[];
  text(emailLines.join("\n"), left, y);
  y += emailLines.length * 5;
  if (receipt.customer.phone) {
    text(receipt.customer.phone, left, y);
    y += 5;
  }
  text(
    `Paid ${new Date(receipt.issuedAt).toLocaleDateString("en-GB", { timeZone: "Africa/Kigali" })}`,
    right,
    72,
    9,
    "normal",
    "right",
  );
  text(`Method ${receipt.method}`, right, 78, 9, "normal", "right");
  text(`Booking ${receipt.bookingReference}`, right, 84, 8, "normal", "right");
  y = Math.max(y + 12, 104);
  line(y - 6);
  text("DESCRIPTION", left, y, 8, "bold");
  text("AMOUNT", right, y, 8, "bold", "right");
  line(y + 3);
  y += 11;
  const description = doc.splitTextToSize(receipt.description, 125) as string[];
  text(description.join("\n"), left, y, 10);
  text(money(receipt.subtotal), right, y, 10, "normal", "right");
  y += description.length * 5 + 3;
  const details = [
    receipt.period,
    `Provider: ${receipt.provider}`,
    ...(receipt.rate != null
      ? [
          `${money(receipt.rate)} / ${receipt.unit} × ${receipt.duration ?? 1} × ${receipt.quantity}`,
        ]
      : []),
  ];
  for (const detail of details) {
    const lines = doc.splitTextToSize(detail, 145) as string[];
    text(lines.join("\n"), left, y, 8);
    y += lines.length * 4.5;
  }
  line(y + 3);
  y += 14;
  for (const [label, value] of [
    ["Subtotal", receipt.subtotal],
    ["Service fee", receipt.serviceFee],
    ["Total", receipt.total],
    ["Amount paid", receipt.amountPaid],
  ] as const) {
    text(label, 122, y, 10, label === "Amount paid" ? "bold" : "normal");
    text(money(value), right, y, 10, label === "Amount paid" ? "bold" : "normal", "right");
    y += 7;
  }
  line(y);
  y += 9;
  text(`Booking status: ${receipt.bookingStatus.replaceAll("_", " ")}`, left, y, 9, "bold");
  y += 7;
  const reference = doc.splitTextToSize(
    `Transaction reference: ${receipt.transactionReference}`,
    174,
  ) as string[];
  text(reference.join("\n"), left, y, 8);
  y += reference.length * 4 + 5;
  if (["EXPIRED", "CANCELLED", "DECLINED", "REJECTED"].includes(receipt.bookingStatus)) {
    text(
      "Payment was received. This booking is not active. Contact support for assistance.",
      left,
      y,
      8,
    );
  }
  text("Questions? Contact support@indanga.com and include your booking reference.", left, 278, 8);
  return Buffer.from(doc.output("arraybuffer"));
}
