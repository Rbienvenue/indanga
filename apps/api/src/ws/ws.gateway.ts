import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
} from "@nestjs/websockets";
import { fromNodeHeaders } from "better-auth/node";
import { Server, Socket } from "socket.io";
import { auth } from "src/lib/auth";
import { env } from "src/lib/env";
import { conversationAccess } from "src/messages/messages-access";
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway({
  cors: { origin: [env.FRONTEND_URL, "https://www.indanga.com"], credentials: true },
})
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(WsGateway.name);

  constructor(private readonly db: PrismaService) {}

  async handleConnection(client: Socket) {
    const origin = client.handshake.headers.origin;
    if (origin && ![env.FRONTEND_URL, "https://www.indanga.com"].includes(origin)) {
      client.disconnect(true);
      return;
    }
    await this.socketSession(client);
  }

  private async socketSession(client: {
    handshake: Socket["handshake"];
    disconnect: (close?: boolean) => unknown;
  }) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(client.handshake.headers),
        query: { disableCookieCache: true },
      });
      if (session && !session.user.banned) return session;
    } catch {
      // Fail closed when session validation is unavailable.
    }
    client.disconnect(true);
    return null;
  }

  @SubscribeMessage("subscribe:notifications")
  async subscribeToNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string },
  ) {
    const session = await this.socketSession(client);
    if (!session) return;
    if (payload?.userId !== session.user.id) {
      client.emit("notification:error", { message: "Access denied" });
      return;
    }
    const room = this.getUserRoom(session.user.id);
    await client.join(room);
    client.emit("subscribed:notifications", { room });
    return { room };
  }

  @SubscribeMessage("subscribe:payment")
  async subscribeToPayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { paymentId?: string },
  ) {
    const session = await this.socketSession(client);
    if (!session) return;
    const payment =
      typeof payload?.paymentId === "string"
        ? await this.db.payment.findFirst({
            where: {
              id: payload.paymentId,
              ...(session.user.role === "admin"
                ? {}
                : {
                    booking: {
                      OR: [
                        { clientId: session.user.id },
                        ...(session.user.role === "landlord"
                          ? [{ house: { ownerId: session.user.id } }]
                          : []),
                      ],
                    },
                  }),
            },
            select: { id: true },
          })
        : null;
    if (!payment) {
      client.emit("payment:error", { message: "Payment not found" });
      return;
    }
    const room = this.getPaymentRoom(payment.id);
    await client.join(room);
    client.emit("subscribed:payment", { room });
    return { room };
  }

  @SubscribeMessage("subscribe:messages")
  async subscribeToMessages(@ConnectedSocket() client: Socket) {
    if (!(await this.socketSession(client))) return;
    await client.join("messages:inbox");
    client.emit("subscribed:messages");
  }

  @SubscribeMessage("unsubscribe:messages")
  async unsubscribeFromMessages(@ConnectedSocket() client: Socket) {
    await client.leave("messages:inbox");
  }

  @SubscribeMessage("subscribe:conversation")
  async subscribeToConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    const session = await this.socketSession(client);
    if (!session) return;
    const conversation =
      typeof payload?.conversationId === "string"
        ? await this.db.conversation.findFirst({
            where: { AND: [{ id: payload.conversationId }, conversationAccess(session.user)] },
            select: { id: true },
          })
        : null;
    if (!conversation) {
      client.emit("messages:error", { message: "Conversation not found" });
      return;
    }
    await client.join(`conversation:${conversation.id}`);
    client.emit("subscribed:conversation", { conversationId: conversation.id });
  }

  @SubscribeMessage("unsubscribe:conversation")
  async unsubscribeFromConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    if (typeof payload?.conversationId === "string")
      await client.leave(`conversation:${payload.conversationId}`);
  }

  async emitConversationUpdate(conversationId: string) {
    try {
      const sockets = await this.server
        .in("messages:inbox")
        .in(`conversation:${conversationId}`)
        .fetchSockets();
      await Promise.all(
        sockets.map(async (client) => {
          const session = await this.socketSession(client);
          if (!session) return;
          const allowed = await this.db.conversation.findFirst({
            where: { AND: [{ id: conversationId }, conversationAccess(session.user)] },
            select: { id: true },
          });
          // Events carry no message/profile data; clients fetch their authorized HTTP projection.
          if (allowed) client.emit("messages:update", { conversationId });
          else await client.leave(`conversation:${conversationId}`);
        }),
      );
    } catch (error) {
      // A realtime outage must not turn an already persisted message into a failed send.
      this.logger.error(
        "Failed to emit conversation update",
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  emitToUser(userId: string, notification: unknown) {
    this.server.to(this.getUserRoom(userId)).emit("notification", notification);
  }

  emitPaymentUpdate(paymentId: string, status: "pending" | "successful" | "failed") {
    this.server.to(this.getPaymentRoom(paymentId)).emit("payment.update", { paymentId, status });
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }
  private getPaymentRoom(paymentId: string) {
    return `payment:${paymentId}`;
  }
}
