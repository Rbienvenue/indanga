import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@indanga/db";
import { AdminService } from "../dist/src/admin/admin.service.js";
import { PaymentsService } from "../dist/src/payments/payments.service.js";

// Run against the compiled API: node --env-file=.env --test test/payment-reporting.test.mjs
// These service tests use database doubles and do not connect to PostgreSQL or a payment provider.
const year = new Date().getFullYear();
const payments = [
  {
    id: "paid",
    amount: new Prisma.Decimal(110000),
    status: "COMPLETED",
    createdAt: new Date(year, 0, 5),
    booking: { serviceFee: 10000 },
  },
  {
    id: "pending",
    amount: new Prisma.Decimal(220000),
    status: "PENDING",
    createdAt: new Date(year, 0, 6),
    booking: { serviceFee: 20000 },
  },
  {
    id: "failed",
    amount: new Prisma.Decimal(330000),
    status: "FAILED",
    createdAt: new Date(year, 0, 7),
    booking: { serviceFee: 30000 },
  },
  {
    id: "legacy",
    amount: new Prisma.Decimal(50000),
    status: "COMPLETED",
    createdAt: new Date(year, 1, 5),
    booking: { serviceFee: null },
  },
  {
    id: "previous-year",
    amount: new Prisma.Decimal(55000),
    status: "COMPLETED",
    createdAt: new Date(year - 1, 0, 5),
    booking: { serviceFee: 5000 },
  },
];

test("Admin revenue counts only completed booking fees; gross collections remain separate", async () => {
  const db = {
    user: { count: async () => 0 },
    house: { count: async () => 0 },
    booking: { count: async () => 0 },
    payment: {
      count: async () => 0,
      findMany: async ({ where }) => payments.filter((payment) => payment.status === where.status),
    },
  };
  const result = await new AdminService(db).getStats();
  assert.equal(result.totalRevenue, 15000);
  assert.equal(result.totalCollected, 215000);
  assert.equal(result.revenueByMonth[0].revenue, 10000);
  assert.equal(
    result.revenueByMonth.reduce((total, month) => total + month.revenue, 0),
    10000,
  );
});

test("Provider earnings exclude service fees and pending/failed money, with owner-scoped totals", async () => {
  const db = {
    payment: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.booking, { house: { ownerId: "provider-1" } });
        assert.deepEqual(where.status.in, ["COMPLETED", "PENDING"]);
        return payments.filter((payment) => where.status.in.includes(payment.status));
      },
    },
  };
  const result = await new PaymentsService(db).getProviderPaymentStats("provider-1");
  assert.deepEqual(result, { earnings: 200000, completedPayments: 3, pendingPayments: 1 });
});

test("Payment history scopes tenant/provider access and preserves status filters and pagination", async () => {
  for (const [role, booking] of [
    ["tenant", { clientId: "user-1" }],
    ["landlord", { house: { ownerId: "user-1" } }],
    ["admin", undefined],
  ]) {
    const expectedWhere = { status: "COMPLETED", ...(booking ? { booking } : {}) };
    const db = {
      payment: {
        findMany: async ({ where, skip, take, include }) => {
          assert.deepEqual(where, expectedWhere);
          assert.equal(skip, 20);
          assert.equal(take, 20);
          assert.deepEqual(include.booking.select.client, { select: { name: true, email: true } });
          return [payments[0], payments[3]];
        },
        count: async ({ where }) => {
          assert.deepEqual(where, expectedWhere);
          return 42;
        },
      },
    };
    const result = await new PaymentsService(db).getPayments(
      { id: "user-1", role },
      { status: "COMPLETED", page: 2, limit: 20 },
    );
    assert.equal(result.data[0].bookingAmount, 100000);
    assert.equal(result.data[1].bookingAmount, 50000);
    assert.deepEqual(result.meta, { total: 42, page: 2, limit: 20, totalPages: 3 });
  }
});

test("Empty payment histories return zero totals", async () => {
  const db = { payment: { findMany: async () => [] } };
  assert.deepEqual(await new PaymentsService(db).getProviderPaymentStats("provider-1"), {
    earnings: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
});
