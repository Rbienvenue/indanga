import assert from "node:assert/strict";
import { test } from "node:test";
import { ReportsService } from "../dist/src/reports/reports.service.js";

test("Reports persist the reporter and listing name; duplicate open reports are rejected", async () => {
  let existing = null;
  let saved;
  const service = new ReportsService({
    house: { findUnique: async () => ({ name: "Example hotel" }) },
    listingReport: {
      findFirst: async ({ where }) => {
        assert.deepEqual(where, { houseId: "house-1", reporterId: "user-1", status: "OPEN" });
        return existing;
      },
      create: async ({ data }) => {
        saved = data;
        return { id: "report-1", ...data };
      },
    },
  });
  const result = await service.create("house-1", "user-1", "The pictures do not match the listing");
  assert.equal(result.id, "report-1");
  assert.equal(saved.listingName, "Example hotel");
  assert.equal(saved.reporterId, "user-1");
  existing = result;
  await assert.rejects(
    service.create("house-1", "user-1", "Another report"),
    /already have an open report/,
  );
  await assert.rejects(
    new ReportsService({ house: { findUnique: async () => null } }).create(
      "missing",
      "user-1",
      "Concern",
    ),
    /Listing not found/,
  );
});

test("Review atomically closes only open reports and retains the admin audit fields", async () => {
  let claim;
  let changed = 1;
  const service = new ReportsService({
    listingReport: {
      updateMany: async (args) => {
        claim = args;
        return { count: changed };
      },
      findUniqueOrThrow: async () => ({ id: "report-1" }),
    },
  });
  await service.review("report-1", "admin-1", {
    status: "RESOLVED",
    reviewNote: "Provider corrected photos",
  });
  assert.deepEqual(claim.where, { id: "report-1", status: "OPEN" });
  assert.equal(claim.data.reviewedBy, "admin-1");
  assert.ok(claim.data.reviewedAt instanceof Date);
  changed = 0;
  await assert.rejects(
    service.review("report-1", "admin-1", { status: "DISMISSED", reviewNote: "Duplicate" }),
    /already reviewed/,
  );
});

test("Report list filters and pagination match their counts", async () => {
  const service = new ReportsService({
    listingReport: {
      findMany: async ({ where, skip, take, include }) => {
        assert.deepEqual(where, { status: "OPEN" });
        assert.equal(skip, 20);
        assert.equal(take, 20);
        assert.deepEqual(include.reporter.select, { name: true, email: true });
        return [];
      },
      count: async ({ where }) => {
        assert.equal(where.status, "OPEN");
        return 22;
      },
    },
  });
  assert.deepEqual((await service.list({ page: 2, limit: 20, status: "OPEN" })).meta, {
    page: 2,
    limit: 20,
    total: 22,
    totalPages: 2,
  });
});
