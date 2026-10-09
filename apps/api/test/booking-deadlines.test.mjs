import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PROVIDER_RESPONSE_HOURS,
  providerResponseDeadline,
  unansweredRequestsWhere,
} from "../dist/src/bookings/booking-deadlines.js";
import { BookingStatusService } from "../dist/src/bookings/booking-status.service.js";
import { CronService } from "../dist/src/cron/cron.service.js";

const booking = {
  id: "request-1",
  status: "REQUESTED",
  createdAt: new Date(),
  responseDeadline: new Date(Date.now() + 3600000),
  clientId: "client-1",
  houseId: "house-1",
  house: {
    ownerId: "owner-1",
    name: "Home",
    propertyType: "House",
    status: "AVAILABLE",
    rooms: [],
  },
  client: { name: "Customer" },
};
const user = { id: "owner-1", role: "landlord" };

test("Response window is 24 hours and legacy requests have the same fallback", () => {
  assert.equal(PROVIDER_RESPONSE_HOURS, 24);
  const createdAt = new Date("2026-10-08T10:00:00Z");
  assert.equal(
    providerResponseDeadline({ createdAt, responseDeadline: null }).toISOString(),
    "2026-10-09T10:00:00.000Z",
  );
  assert.equal(providerResponseDeadline(booking), booking.responseDeadline);
  const where = unansweredRequestsWhere(new Date("2026-10-09T10:00:00Z"));
  assert.equal(where.status, "REQUESTED");
  assert.equal(where.OR[1].createdAt.lte.toISOString(), createdAt.toISOString());
});

test("Expired requests cannot be accepted or declined, including legacy requests", async () => {
  for (const responseDeadline of [new Date(Date.now() - 1), null]) {
    const service = new BookingStatusService({
      booking: {
        findUnique: async () => ({
          ...booking,
          responseDeadline,
          createdAt: new Date(Date.now() - 25 * 3600000),
        }),
      },
    });
    for (const status of ["AWAITING_PAYMENT", "DECLINED"])
      await assert.rejects(
        service.updateBookingStatus(booking.id, { status, declineReason: "Unavailable" }, user),
        /response deadline has passed/,
      );
  }
});

test("Acceptance rechecks the deadline inside the transaction and preserves the 30-minute payment window", async () => {
  let current = booking;
  let saved;
  const tx = {
    booking: {
      findUnique: async () => current,
      count: async () => 0,
      update: async ({ data }) => {
        saved = data;
        return { ...current, ...data };
      },
    },
  };
  const service = new BookingStatusService(
    { booking: { findUnique: async () => booking }, $transaction: async (fn) => fn(tx) },
    { create: async () => {} },
  );
  current = { ...booking, responseDeadline: new Date(Date.now() - 1) };
  await assert.rejects(
    service.updateBookingStatus(booking.id, { status: "AWAITING_PAYMENT" }, user),
    /response deadline has passed/,
  );
  current = booking;
  await service.updateBookingStatus(booking.id, { status: "AWAITING_PAYMENT" }, user);
  assert.equal(saved.status, "AWAITING_PAYMENT");
  assert.ok(Math.abs(saved.paymentDeadline.getTime() - Date.now() - 30 * 60000) < 1000);
});

test("Declines require a reason and atomically claim an unanswered request", async () => {
  let claim;
  let notification;
  const service = new BookingStatusService(
    {
      booking: {
        findUnique: async () => booking,
        updateMany: async (args) => {
          claim = args;
          return { count: 1 };
        },
        findUniqueOrThrow: async () => ({ ...booking, declineReason: "Dates unavailable" }),
      },
    },
    {
      create: async (data) => {
        notification = data;
      },
    },
  );
  await assert.rejects(
    service.updateBookingStatus(booking.id, { status: "DECLINED", declineReason: " " }, user),
    /reason is required/,
  );
  await service.updateBookingStatus(
    booking.id,
    { status: "DECLINED", declineReason: " Dates unavailable " },
    user,
  );
  assert.equal(claim.where.status, "REQUESTED");
  assert.equal(claim.where.NOT.status, "REQUESTED");
  assert.equal(claim.data.declineReason, "Dates unavailable");
  assert.match(notification.message, /Dates unavailable/);
});

test("Expiry cannot overwrite an accepted request and notifies both parties only when claimed", async () => {
  const messages = [];
  const service = new CronService(
    {
      booking: {
        findMany: async ({ where }) => {
          assert.equal(where.status, "REQUESTED");
          return [booking, { ...booking, id: "accepted" }];
        },
        updateMany: async ({ where, data }) => {
          assert.equal(where.status, "REQUESTED");
          assert.equal(data.status, "EXPIRED");
          return { count: where.id === "accepted" ? 0 : 1 };
        },
      },
    },
    { create: async (data) => messages.push(data) },
  );
  assert.equal(await service.expireUnansweredRequests(), 1);
  assert.deepEqual(
    messages.map(({ userId }) => userId),
    ["client-1", "owner-1"],
  );
});
