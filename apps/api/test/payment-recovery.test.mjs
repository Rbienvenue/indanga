import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@indanga/db";
import { PaymentsService } from "../dist/src/payments/payments.service.js";

const booking = {
  id: "booking-1",
  clientId: "customer-1",
  status: "AWAITING_PAYMENT",
  paymentDeadline: new Date(Date.now() + 1800000),
  totalAmount: 110000,
  house: {},
  client: {},
};
const payment = {
  id: "payment-1",
  bookingId: booking.id,
  status: "PENDING",
  amount: new Prisma.Decimal(110000),
  method: "CARD",
  checkoutUrl: "https://checkout.example/payment-1",
  transactionReference: "pcode-1",
  booking: { clientId: "customer-1", status: "AWAITING_PAYMENT", serviceFee: 10000 },
};

test("Recovery reads the existing attempt without initiating another charge and keeps customer scope", async () => {
  for (const role of ["tenant", "landlord", "admin"]) {
    const service = new PaymentsService(
      {
        payment: {
          findMany: async ({ where, take, orderBy, include }) => {
            assert.equal(where.bookingId, booking.id);
            assert.equal(take, 1);
            assert.deepEqual(orderBy, { createdAt: "desc" });
            assert.equal(include.booking.select.status, true);
            if (role === "tenant") assert.deepEqual(where.booking, { clientId: "customer-1" });
            if (role === "landlord")
              assert.deepEqual(where.booking, {
                OR: [{ clientId: "customer-1" }, { house: { ownerId: "customer-1" } }],
              });
            return [payment];
          },
          count: async () => 1,
        },
      },
      null,
      { initiatePayment: async () => assert.fail("Recovery must not charge") },
    );
    const result = await service.getPayments(
      { id: "customer-1", role },
      { bookingId: booking.id, limit: 1 },
    );
    assert.equal(result.data[0].id, payment.id);
    assert.equal(result.data[0].status, "PENDING");
    assert.equal(result.data[0].checkoutUrl, payment.checkoutUrl);
  }
});

test("Providers viewing a customer's payment never receive its checkout URL", async () => {
  const service = new PaymentsService({
    payment: { findMany: async () => [payment], count: async () => 1 },
  });
  assert.equal(
    (await service.getPayments({ id: "owner-1", role: "landlord" }, {})).data[0].checkoutUrl,
    null,
  );
});

test("Another payment cannot be initiated while one is pending or completed", async () => {
  for (const status of ["PENDING", "COMPLETED"]) {
    const tx = {
      booking: { findUnique: async () => booking },
      payment: { findFirst: async () => ({ ...payment, status }) },
    };
    const service = new PaymentsService(
      { booking: { findFirst: async () => booking }, $transaction: async (fn) => fn(tx) },
      null,
      { initiatePayment: async () => assert.fail("Must not charge again") },
    );
    await assert.rejects(
      service.initiatePayment("customer-1", {
        bookingId: booking.id,
        method: "MOMO",
        phone: "250780000000",
      }),
      status === "PENDING" ? /already pending/ : /already been paid/,
    );
  }
});

test("Card checkout URL and PCODE are persisted so a refreshed screen resumes the same checkout", async () => {
  let saved;
  const tx = {
    booking: { findUnique: async () => booking },
    payment: {
      findFirst: async () => null,
      create: async ({ data }) => ({ id: payment.id, ...data }),
      update: async ({ data }) => {
        saved = data;
        return { ...payment, ...data };
      },
    },
  };
  let charges = 0;
  const service = new PaymentsService(
    { booking: { findFirst: async () => booking }, $transaction: async (fn) => fn(tx) },
    null,
    {
      initiatePayment: async () => {
        charges++;
        return { PCODE: "card-code", link: payment.checkoutUrl };
      },
    },
  );
  const result = await service.initiatePayment("customer-1", {
    bookingId: booking.id,
    method: "CARD",
  });
  assert.deepEqual(saved, { transactionReference: "card-code", checkoutUrl: payment.checkoutUrl });
  assert.equal(result.id, payment.id);
  assert.equal(charges, 1);
});

test("Late successful payments remain paid without confirming released inventory; duplicate callbacks are harmless", async () => {
  let changed = 1;
  const updates = [];
  const tx = {
    payment: {
      updateMany: async ({ where }) => {
        assert.equal(where.status, "PENDING");
        return { count: changed };
      },
    },
    booking: {
      findUniqueOrThrow: async () => ({ ...booking, status: "EXPIRED" }),
      update: async () => assert.fail("Must not revive booking"),
    },
    house: { update: async () => assert.fail("Must not reserve released inventory") },
  };
  const service = new PaymentsService(
    {
      $transaction: async (fn) => fn(tx),
      payment: { findUniqueOrThrow: async () => ({ ...payment, status: "COMPLETED" }) },
    },
    { create: async (data) => updates.push(data) },
    null,
    { emitPaymentUpdate: () => {} },
  );
  const original = {
    ...booking,
    house: { ownerId: "owner-1", name: "Hotel" },
    client: { id: "customer-1", name: "Customer" },
  };
  assert.equal(
    (await service.markPaymentSuccessful(payment, original, payment.transactionReference)).status,
    "COMPLETED",
  );
  assert.equal(updates.length, 2);
  assert.match(updates[1].title, /not confirmed/);
  changed = 0;
  await service.markPaymentSuccessful(payment, original, payment.transactionReference);
  assert.equal(updates.length, 2);
});
