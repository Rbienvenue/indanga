import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaClient, PrismaPg } from "@indanga/db";

// Run after building db/api: node --env-file=.env --test test/messages.integration.test.mjs
// All fixtures and schema changes go into a temporary LOCAL database, never the configured database.
const dbRequire = createRequire(new URL("../../../packages/db/package.json", import.meta.url));
const pg = dbRequire("pg");
const webRequire = createRequire(new URL("../../web/package.json", import.meta.url));
const { io } = webRequire("socket.io-client");
const apiDirectory = fileURLToPath(new URL("../", import.meta.url));
const dbDirectory = fileURLToPath(new URL("../../../packages/db/", import.meta.url));
const sourceUrl = new URL(process.env.DATABASE_URL);
assert.ok(
  ["localhost", "127.0.0.1", "::1"].includes(sourceUrl.hostname),
  "Tests require local PostgreSQL",
);
const databaseName = `indanga_messages_test_${process.pid}`;
const databaseUrl = new URL(sourceUrl);
databaseUrl.pathname = `/${databaseName}`;
const control = new pg.Pool({ connectionString: sourceUrl.toString() });
let db;
let server;
const sockets = [];
let logs = "";

async function unusedPort() {
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const { port } = listener.address();
  await new Promise((resolve) => listener.close(resolve));
  return port;
}

function nextEvent(socket, event) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out: ${event}`));
    }, 5000);
    function handler(value) {
      clearTimeout(timer);
      resolve(value);
    }
    socket.once(event, handler);
  });
}

await test(
  "Messaging: persistence, privacy, unread state and realtime authorization",
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
          BETTER_AUTH_SECRET: "messaging-integration-test-secret-only",
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
          body: await response.json(),
          cookies: response.headers.getSetCookie(),
        };
      }
      function cookieHeader(cookies) {
        return cookies.map((cookie) => cookie.split(";")[0]).join("; ");
      }
      async function actor(name, role, phoneNumber) {
        const email = `${phoneNumber}@messages.example`;
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
      const client = await actor("Guest Test", "tenant", "0780000001");
      const stranger = await actor("Other Guest", "tenant", "0780000002");
      const provider = await actor("PRIVATE PROVIDER", "landlord", "0780000003");
      const otherProvider = await actor("Other Provider", "landlord", "0780000004");
      const admin = await actor("PRIVATE ADMIN ONE", "admin", "0780000005");
      const secondAdmin = await actor("PRIVATE ADMIN TWO", "admin", "0780000006");
      const house = await db.house.create({
        data: {
          name: "Kigali Heights",
          location: "Kigali",
          ownerId: provider.id,
          description: "Test property",
          propertyType: "Hotel",
          bedrooms: 1,
          bathrooms: 1,
        },
      });
      const booking = await db.booking.create({
        data: { clientId: client.id, houseId: house.id, bookingId: "TEST-00482" },
      });
      const payment = await db.payment.create({
        data: {
          bookingId: booking.id,
          amount: 100,
          method: "test",
          transactionReference: "messaging-test",
        },
      });
      let supportId;
      let propertyId;
      let replyId;

      await t.test("Thread creation is idempotent and public identities are safe", async () => {
        const support = await request("/messages/conversations/support", client, {});
        assert.equal(support.status, 201);
        supportId = support.body.data.id;
        assert.equal(support.body.data.displayName, "INDANGA Support");
        const repeated = await Promise.all(
          Array.from({ length: 3 }, () => request("/messages/conversations/support", client, {})),
        );
        assert.ok(repeated.every((result) => result.body.data.id === supportId));
        const property = await request("/messages/conversations/property", client, {
          bookingId: booking.id,
        });
        assert.equal(property.status, 201);
        propertyId = property.body.data.id;
        assert.equal(property.body.data.displayName, house.name);
        const duplicate = await request("/messages/conversations/property", provider, {
          bookingId: booking.id,
        });
        assert.equal(duplicate.body.data.id, propertyId);
        assert.equal(await db.conversation.count(), 2);
      });

      await t.test(
        "HTTP authorization rejects outsiders and unauthenticated requests",
        async () => {
          assert.equal((await request("/messages/conversations")).status, 401);
          for (const outsider of [stranger, otherProvider, admin]) {
            assert.equal(
              (await request(`/messages/conversations/${propertyId}/messages`, outsider)).status,
              404,
            );
            assert.equal(
              (
                await request(`/messages/conversations/${propertyId}/messages`, outsider, {
                  text: "Forbidden",
                })
              ).status,
              404,
            );
            assert.equal(
              (
                await request("/messages/conversations/property", outsider, {
                  bookingId: booking.id,
                })
              ).status,
              404,
            );
          }
          assert.equal(
            (await request(`/messages/conversations/${supportId}`, provider)).status,
            404,
          );
          assert.equal((await request("/messages/conversations/support", admin, {})).status, 403);
        },
      );

      await t.test("Server chooses sender, validates text and masks staff profiles", async () => {
        assert.equal(
          (await request(`/messages/conversations/${propertyId}/messages`, client, { text: "  " }))
            .status,
          400,
        );
        assert.equal(
          (
            await request(`/messages/conversations/${propertyId}/messages`, client, {
              text: "x".repeat(4001),
            })
          ).status,
          400,
        );
        await request(`/messages/conversations/${propertyId}/messages`, client, {
          text: "Breakfast?",
          senderId: provider.id,
        });
        const reply = await request(`/messages/conversations/${propertyId}/messages`, provider, {
          text: " Yes, included. ",
        });
        assert.equal(reply.status, 201);
        replyId = reply.body.data.id;
        assert.equal(reply.body.data.text, "Yes, included.");
        assert.equal(reply.body.data.sender.displayName, house.name);
        const supportReply = await request(`/messages/conversations/${supportId}/messages`, admin, {
          text: "We can help.",
        });
        assert.equal(supportReply.body.data.sender.displayName, "INDANGA Support");
        await request(`/messages/conversations/${supportId}/messages`, secondAdmin, {
          text: "Follow-up.",
        });
        const stored = await db.message.findFirst({ where: { text: "Breakfast?" } });
        assert.equal(stored.senderId, client.id);
        for (const path of [
          "/messages/conversations",
          `/messages/conversations/${propertyId}`,
          `/messages/conversations/${propertyId}/messages`,
          `/messages/conversations/${supportId}/messages`,
        ]) {
          const response = await request(path, client);
          const json = JSON.stringify(response.body);
          for (const privateValue of [
            provider.name,
            provider.id,
            provider.email,
            admin.name,
            admin.id,
            admin.email,
            secondAdmin.name,
          ])
            assert.ok(!json.includes(privateValue), `Leaked ${privateValue}`);
          assert.ok(!json.includes('"senderId"'));
        }
      });

      await t.test(
        "Unread positions advance without losing concurrent or delayed messages",
        async () => {
          const countFor = async (person) => {
            const result = await request("/messages/conversations/unread-count", person);
            assert.equal(result.status, 200);
            return result.body.data.count;
          };
          assert.equal((await request("/messages/conversations/unread-count")).status, 401);
          assert.equal(await countFor(client), 3);
          assert.equal(await countFor(provider), 1);
          assert.equal(await countFor(admin), 1);
          assert.equal(await countFor(stranger), 0);
          assert.equal(await countFor(otherProvider), 0);
          const firstPage = await request("/messages/conversations?limit=1", client);
          assert.equal(firstPage.body.meta.totalPages, 2);
          assert.ok(firstPage.body.data[0].unreadCount < (await countFor(client)));
          let inbox = await request("/messages/conversations", client);
          assert.equal(inbox.body.data.find((thread) => thread.id === propertyId).unreadCount, 1);
          await request(`/messages/conversations/${propertyId}/read`, client, {
            messageId: replyId,
          });
          assert.equal(await countFor(client), 2);
          const replies = await Promise.all(
            Array.from({ length: 3 }, (_, index) =>
              request(`/messages/conversations/${propertyId}/messages`, provider, {
                text: `Concurrent ${index}`,
              }),
            ),
          );
          assert.ok(replies.every((reply) => reply.status === 201));
          const history = await request(
            `/messages/conversations/${propertyId}/messages?limit=2`,
            client,
          );
          assert.equal(history.body.data.length, 2);
          assert.equal(history.body.meta.total, 5);
          const newest = history.body.data[0];
          await request(`/messages/conversations/${propertyId}/read`, client, {
            messageId: newest.id,
          });
          await request(`/messages/conversations/${propertyId}/read`, client, {
            messageId: replyId,
          });
          inbox = await request("/messages/conversations", client);
          assert.equal(inbox.body.data.find((thread) => thread.id === propertyId).unreadCount, 0);
          assert.equal(await countFor(client), 2);
          assert.equal(
            (
              await request(`/messages/conversations/${supportId}/read`, client, {
                messageId: replyId,
              })
            ).status,
            404,
          );
          assert.equal((await request("/messages/conversations?limit=1000", client)).status, 400);
        },
      );

      async function connect(person) {
        const socket = io(base, {
          transports: ["websocket"],
          extraHeaders: { Origin: frontend, ...(person ? { Cookie: person.cookie } : {}) },
          reconnection: false,
        });
        sockets.push(socket);
        await nextEvent(socket, "connect");
        return socket;
      }
      await t.test("Realtime subscriptions and delivery enforce current ownership", async () => {
        const clientSocket = await connect(client);
        const providerSocket = await connect(provider);
        const strangerSocket = await connect(stranger);
        for (const socket of [clientSocket, providerSocket, strangerSocket]) {
          const subscribed = nextEvent(socket, "subscribed:messages");
          socket.emit("subscribe:messages");
          await subscribed;
        }
        const denied = nextEvent(strangerSocket, "messages:error");
        strangerSocket.emit("subscribe:conversation", { conversationId: propertyId });
        await denied;
        const notificationDenied = nextEvent(strangerSocket, "notification:error");
        strangerSocket.emit("subscribe:notifications", { userId: client.id });
        await notificationDenied;
        const paymentDenied = nextEvent(strangerSocket, "payment:error");
        strangerSocket.emit("subscribe:payment", { paymentId: payment.id });
        await paymentDenied;
        const paymentAllowed = nextEvent(clientSocket, "subscribed:payment");
        clientSocket.emit("subscribe:payment", { paymentId: payment.id });
        await paymentAllowed;
        let leaked = false;
        strangerSocket.on("messages:update", () => {
          leaked = true;
        });
        const event = nextEvent(clientSocket, "messages:update");
        await request(`/messages/conversations/${propertyId}/messages`, provider, {
          text: "Realtime reply",
        });
        assert.deepEqual(await event, { conversationId: propertyId });
        assert.equal(leaked, false);
        await db.house.update({ where: { id: house.id }, data: { ownerId: otherProvider.id } });
        let formerOwnerReceived = false;
        providerSocket.on("messages:update", () => {
          formerOwnerReceived = true;
        });
        await request(`/messages/conversations/${propertyId}/messages`, client, {
          text: "New owner question",
        });
        assert.equal(formerOwnerReceived, false);
        assert.equal(
          (await request(`/messages/conversations/${propertyId}`, provider)).status,
          404,
        );
        await db.house.update({ where: { id: house.id }, data: { ownerId: provider.id } });
        await db.session.deleteMany({ where: { userId: stranger.id } });
        const disconnected = nextEvent(strangerSocket, "disconnect");
        strangerSocket.emit("subscribe:messages");
        await disconnected;
        const anonymous = await connect(null);
        if (anonymous.connected) await nextEvent(anonymous, "disconnect");
      });

      await t.test(
        "Messages survive deleted bookings/properties without exposing identities",
        async () => {
          await db.booking.delete({ where: { id: booking.id } });
          assert.ok(
            (await request(`/messages/conversations/${propertyId}/messages`, client)).body.meta
              .total > 0,
          );
          await db.house.delete({ where: { id: house.id } });
          const history = await request(`/messages/conversations/${propertyId}/messages`, client);
          assert.equal(history.status, 200);
          assert.equal(
            history.body.data.find((message) => message.id === replyId).sender.displayName,
            house.name,
          );
          assert.ok((await db.message.count()) > 0);
        },
      );
    } finally {
      for (const socket of sockets) socket.disconnect();
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
