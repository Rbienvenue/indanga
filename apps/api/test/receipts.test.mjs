import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFileSync } from "node:fs";
import { ReceiptsService } from "../dist/src/payments/receipts.service.js";
import { generateReceiptPdf } from "../dist/src/payments/receipt-pdf.js";

const booking = {
  id: "booking-1",
  bookingId: "IND-HTL-261012345",
  status: "CONFIRMED",
  serviceFee: 10000,
  unitPrice: 50000,
  nights: 2,
  roomCount: 1,
  checkIn: new Date("2026-10-12"),
  checkOut: new Date("2026-10-14"),
  client: { name: "Jean Uwase", email: "jean@example.com", phoneNumber: "+250780000000" },
  house: { name: "Grotta Resort", propertyType: "Hotel", owner: { name: "Grotta Resort" } },
  roomType: { name: "Deluxe room" },
};
const payment = {
  id: "cmreceipt123456789",
  status: "COMPLETED",
  amount: "110000",
  updatedAt: new Date("2026-10-09T09:00:00Z"),
  method: "MOMO",
  transactionReference: "tx-123456",
  booking,
};

test("Receipt access includes customer, owning provider and admin, not arbitrary providers", async () => {
  for (const role of ["tenant", "landlord", "admin"]) {
    const service = new ReceiptsService({
      payment: {
        findFirst: async ({ where }) => {
          assert.equal(where.id, payment.id);
          assert.deepEqual(
            where.booking,
            role === "admin"
              ? undefined
              : {
                  OR: [
                    { clientId: "user-1" },
                    ...(role === "landlord" ? [{ house: { ownerId: "user-1" } }] : []),
                  ],
                },
          );
          return payment;
        },
      },
    });
    const receipt = await service.getReceipt(payment.id, { id: "user-1", role });
    assert.equal(receipt.subtotal, 100000);
    assert.equal(receipt.serviceFee, 10000);
    assert.equal(receipt.total, 110000);
    assert.equal(receipt.amountPaid, 110000);
    assert.equal(receipt.bookingStatus, "CONFIRMED");
    const pdf = generateReceiptPdf(receipt);
    assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
    if (process.env.RECEIPT_SAMPLE_PATH) writeFileSync(process.env.RECEIPT_SAMPLE_PATH, pdf);
  }
});

test("Pending payments cannot produce receipts; late successful payments retain expired booking status", async () => {
  const missing = new ReceiptsService({ payment: { findFirst: async () => null } });
  await assert.rejects(
    missing.getReceipt("other", { id: "user-1", role: "tenant" }),
    /Payment not found/,
  );
  for (const status of ["PENDING", "FAILED"]) {
    const service = new ReceiptsService({
      payment: { findFirst: async () => ({ ...payment, status }) },
    });
    await assert.rejects(
      service.getReceipt(payment.id, { id: "user-1", role: "tenant" }),
      /successful payments only/,
    );
  }
  const late = new ReceiptsService({
    payment: {
      findFirst: async () => ({ ...payment, booking: { ...booking, status: "EXPIRED" } }),
    },
  });
  assert.equal(
    (await late.getReceipt(payment.id, { id: "user-1", role: "tenant" })).bookingStatus,
    "EXPIRED",
  );
});
