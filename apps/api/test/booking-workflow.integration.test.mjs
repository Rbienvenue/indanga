import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaClient, PrismaPg } from "@indanga/db";

// Run after db/api builds: node --env-file=.env --test test/booking-workflow.integration.test.mjs
// Fixtures live in a disposable LOCAL database. Gateway calls are blocked by a local dummy URL.
const dbRequire = createRequire(new URL("../../../packages/db/package.json", import.meta.url));
const pg = dbRequire("pg");
const apiDirectory = fileURLToPath(new URL("../", import.meta.url));
const dbDirectory = fileURLToPath(new URL("../../../packages/db/", import.meta.url));
const sourceUrl = new URL(process.env.DATABASE_URL);
assert.ok(
  ["localhost", "127.0.0.1", "::1"].includes(sourceUrl.hostname),
  "Tests require local PostgreSQL",
);
const databaseName = `indanga_workflow_test_${process.pid}`;
const databaseUrl = new URL(sourceUrl);
databaseUrl.pathname = `/${databaseName}`;
const control = new pg.Pool({ connectionString: sourceUrl.toString() });
let db;
let server;
let logs = "";

async function unusedPort() {
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const { port } = listener.address();
  await new Promise((resolve) => listener.close(resolve));
  return port;
}

await test(
  "Booking workflow: deadlines, decline reasons, reports, receipts and payment recovery",
  { timeout: 120000 },
  async (t) => {
    try {
      await control.query(`CREATE DATABASE "${databaseName}"`);
      execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "push"], {
        cwd: dbDirectory,
        env: { ...process.env, DATABASE_URL: databaseUrl.toString() },
        stdio: "pipe",
      });
      db = new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl.toString() }),
      });
      const port = await unusedPort();
      const base = `http://localhost:${port}`;
      const frontend = "http://localhost:3000";
      server = spawn(process.execPath, ["dist/src/main.js"], {
        cwd: apiDirectory,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl.toString(),
          PORT: String(port),
          BETTER_AUTH_URL: base,
          FRONTEND_URL: frontend,
          BETTER_AUTH_SECRET: "workflow-integration-test-secret-only",
          ITEC_API_URL: "http://127.0.0.1:1",
          CRON_SECRET: "workflow-test-cron",
          ITEC_MOMO_API_KEY: "test",
          ITEC_CARD_API_KEY: "test",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      server.stdout.on("data", (data) => {
        logs += data;
      });
      server.stderr.on("data", (data) => {
        logs += data;
      });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (server.exitCode !== null) throw new Error(`API exited: ${logs}`);
        try {
          await fetch(`${base}/v1/auth/get-session`);
          break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      async function request(path, actor, body, method = body === undefined ? "GET" : "POST") {
        const response = await fetch(`${base}/v1${path}`, {
          method,
          headers: {
            Origin: frontend,
            ...(actor ? { Cookie: actor.cookie } : {}),
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        return {
          status: response.status,
          body: response.headers.get("content-type")?.includes("application/pdf")
            ? Buffer.from(await response.arrayBuffer())
            : await response.json(),
          cookies: response.headers.getSetCookie(),
        };
      }
      function cookieHeader(cookies) {
        return cookies.map((cookie) => cookie.split(";")[0]).join("; ");
      }
      async function actor(name, role, phoneNumber) {
        const email = `${phoneNumber}@workflow.example`;
        const signup = await request("/auth/sign-up/email", null, {
          name,
          email,
          password: "messages-test-password",
          phoneNumber,
          termsAccepted: true,
          accountType: role === "landlord" ? "landlord" : "tenant",
        });
        assert.equal(signup.status, 200, JSON.stringify(signup.body));
        await db.user.update({
          where: { id: signup.body.user.id },
          data: { role, kycStatus: "APPROVED" },
        });
        const login = await request("/auth/sign-in/email", null, {
          email,
          password: "messages-test-password",
        });
        assert.equal(login.status, 200, JSON.stringify(login.body));
        return { id: signup.body.user.id, name, email, cookie: cookieHeader(login.cookies) };
      }
      const client = await actor("Customer", "tenant", "0780000001");
      const stranger = await actor("Other customer", "tenant", "0780000002");
      const provider = await actor("Provider", "landlord", "0780000003");
      const otherProvider = await actor("Other provider", "landlord", "0780000004");
      const admin = await actor("Admin", "admin", "0780000005");
      const house = await db.house.create({
        data: {
          name: "Kigali Home",
          location: "Kigali",
          ownerId: provider.id,
          description: "Test property",
          propertyType: "House",
          bedrooms: 1,
          bathrooms: 1,
          price: 100000,
          status: "AVAILABLE",
        },
      });
      let accepted;
      let declined;
      let report;
      let paid;

      await t.test(
        "Requests save a 24-hour deadline and require an owner-scoped decline reason",
        async () => {
          const requestBooking = await request("/bookings", client, { houseId: house.id });
          assert.equal(requestBooking.status, 201, JSON.stringify(requestBooking.body));
          declined = requestBooking.body.data;
          assert.ok(
            Math.abs(
              new Date(declined.responseDeadline) - new Date(declined.createdAt) - 24 * 3600000,
            ) < 1000,
          );
          const endpoint = `/bookings/${declined.id}/status`;
          assert.equal(
            (
              await request(
                endpoint,
                otherProvider,
                { status: "DECLINED", declineReason: "Unavailable" },
                "PATCH",
              )
            ).status,
            403,
          );
          assert.equal(
            (await request(endpoint, provider, { status: "DECLINED" }, "PATCH")).status,
            400,
          );
          const result = await request(
            endpoint,
            provider,
            { status: "DECLINED", declineReason: "  Maintenance on these dates  " },
            "PATCH",
          );
          assert.equal(result.status, 200, JSON.stringify(result.body));
          assert.equal(result.body.data.declineReason, "Maintenance on these dates");
          assert.equal(
            (await request(`/bookings/${declined.id}`, client)).body.data.declineReason,
            "Maintenance on these dates",
          );
        },
      );

      await t.test(
        "Acceptance has a separate 30-minute payment window; expired requests cannot be handled",
        async () => {
          const result = await request("/bookings", client, { houseId: house.id });
          assert.equal(result.status, 201, JSON.stringify(result.body));
          accepted = result.body.data;
          const accept = await request(
            `/bookings/${accepted.id}/status`,
            provider,
            { status: "AWAITING_PAYMENT" },
            "PATCH",
          );
          assert.equal(accept.status, 200, JSON.stringify(accept.body));
          assert.ok(
            Math.abs(new Date(accept.body.data.paymentDeadline) - Date.now() - 30 * 60000) < 5000,
          );
          const expired = await db.booking.create({
            data: {
              clientId: client.id,
              houseId: house.id,
              status: "REQUESTED",
              responseDeadline: new Date(Date.now() - 1000),
            },
          });
          assert.equal(
            (
              await request(
                `/bookings/${expired.id}/status`,
                provider,
                { status: "AWAITING_PAYMENT" },
                "PATCH",
              )
            ).status,
            400,
          );
          const legacy = await db.booking.create({
            data: {
              clientId: client.id,
              houseId: house.id,
              status: "REQUESTED",
              createdAt: new Date(Date.now() - 25 * 3600000),
            },
          });
          const response = await fetch(`${base}/v1/cron/expire-bookings`, {
            headers: { Authorization: "Bearer workflow-test-cron" },
          });
          assert.equal(response.status, 200);
          assert.equal(
            (await db.booking.findUniqueOrThrow({ where: { id: expired.id } })).status,
            "EXPIRED",
          );
          assert.equal(
            (await db.booking.findUniqueOrThrow({ where: { id: legacy.id } })).status,
            "EXPIRED",
          );
          assert.equal(
            (await db.booking.findUniqueOrThrow({ where: { id: accepted.id } })).status,
            "AWAITING_PAYMENT",
          );
        },
      );

      await t.test("Listing reports persist and only admins can review them", async () => {
        const path = `/properties/${house.id}/reports`;
        assert.equal((await request(path, null, { reason: "Misleading photographs" })).status, 401);
        assert.equal((await request(path, client, { reason: "bad" })).status, 400);
        const submitted = await request(path, client, {
          reason: "The photographs show a different building",
        });
        assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
        report = submitted.body.data;
        assert.equal(report.reporterId, client.id);
        assert.equal(
          (await request(path, client, { reason: "The photographs show a different building" }))
            .status,
          409,
        );
        assert.equal((await request("/admin/reports", provider)).status, 403);
        const list = await request("/admin/reports?status=OPEN", admin);
        assert.equal(list.body.data[0].id, report.id);
        assert.equal(
          (
            await request(
              `/admin/reports/${report.id}`,
              provider,
              { status: "RESOLVED", reviewNote: "Updated photos" },
              "PATCH",
            )
          ).status,
          403,
        );
        const reviewed = await request(
          `/admin/reports/${report.id}`,
          admin,
          { status: "RESOLVED", reviewNote: "Updated photos" },
          "PATCH",
        );
        assert.equal(reviewed.status, 200, JSON.stringify(reviewed.body));
        assert.equal(reviewed.body.data.reviewedBy, admin.id);
        assert.equal(reviewed.body.data.status, "RESOLVED");
      });

      await t.test(
        "Pending attempts survive refresh; a second initiation is rejected and checkout links stay private",
        async () => {
          paid = await db.payment.create({
            data: {
              bookingId: accepted.id,
              amount: 110000,
              method: "CARD",
              transactionReference: "workflow-card-code",
              checkoutUrl: "https://checkout.example/continue",
            },
          });
          const endpoint = `/payments?bookingId=${accepted.id}&limit=1`;
          for (let refresh = 0; refresh < 2; refresh++) {
            const result = await request(endpoint, client);
            assert.equal(result.status, 200);
            assert.equal(result.body.data[0].id, paid.id);
            assert.equal(result.body.data[0].checkoutUrl, paid.checkoutUrl);
            assert.equal(result.body.data[0].status, "PENDING");
          }
          assert.equal((await request(endpoint, stranger)).body.data.length, 0);
          assert.equal((await request(endpoint, provider)).body.data[0].checkoutUrl, null);
          assert.equal(
            (await request(`/bookings/${accepted.id}`, provider)).body.data.payments[0].checkoutUrl,
            null,
          );
          assert.equal(
            (
              await request("/payments", client, {
                bookingId: accepted.id,
                method: "MOMO",
                phone: "250780000000",
              })
            ).status,
            409,
          );
          assert.equal(await db.payment.count(), 1);
          assert.equal((await request(`/payments/${paid.id}/receipt`, client)).status, 400);
          await db.payment.update({ where: { id: paid.id }, data: { status: "COMPLETED" } });
          await db.booking.update({
            where: { id: accepted.id },
            data: {
              status: "CONFIRMED",
              totalAmount: 110000,
              serviceFee: 10000,
              unitPrice: 100000,
            },
          });
          const recovered = await request(endpoint, client);
          assert.equal(recovered.body.data[0].status, "COMPLETED");
          assert.equal(recovered.body.data[0].booking.status, "CONFIRMED");
        },
      );

      await t.test(
        "Paid receipts have correct totals and PDFs, with customer/provider/admin access only",
        async () => {
          for (const viewer of [client, provider, admin]) {
            const receipt = await request(`/payments/${paid.id}/receipt`, viewer);
            assert.equal(receipt.status, 200, JSON.stringify(receipt.body));
            assert.equal(receipt.body.data.subtotal, 100000);
            assert.equal(receipt.body.data.serviceFee, 10000);
            assert.equal(receipt.body.data.total, 110000);
            assert.equal(receipt.body.data.bookingStatus, "CONFIRMED");
          }
          for (const outsider of [stranger, otherProvider])
            assert.equal((await request(`/payments/${paid.id}/receipt`, outsider)).status, 404);
          const pdf = await request(`/payments/${paid.id}/receipt.pdf`, client);
          assert.equal(pdf.status, 200);
          assert.equal(pdf.body.subarray(0, 4).toString(), "%PDF");
          await db.booking.update({ where: { id: accepted.id }, data: { status: "EXPIRED" } });
          assert.equal(
            (await request(`/payments/${paid.id}/receipt`, client)).body.data.bookingStatus,
            "EXPIRED",
          );
        },
      );

      await t.test("Report audit survives listing deletion", async () => {
        await db.house.delete({ where: { id: house.id } });
        const retained = await db.listingReport.findUniqueOrThrow({ where: { id: report.id } });
        assert.equal(retained.houseId, null);
        assert.equal(retained.listingName, "Kigali Home");
        assert.equal(retained.reviewNote, "Updated photos");
      });
    } finally {
      if (server && server.exitCode === null) {
        server.kill("SIGTERM");
        await once(server, "exit");
      }
      if (db) await db.$disconnect();
      await control.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`);
      await control.end();
    }
  },
);
