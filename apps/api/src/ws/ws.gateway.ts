import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { env } from "src/lib/env";

type NotificationPayload = {
  userId: string;
};

type PaymentPayload = {
  paymentId: string;
};

@WebSocketGateway({
  cors: {
    origin: [env.FRONTEND_URL],
    credentials: true,
  },
})
export class WsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("subscribe:notifications")
  subscribeToNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NotificationPayload,
  ) {
    if (!payload?.userId) {
      client.emit("notification:error", { message: "userId is required" });
      return;
    }

    const room = this.getUserRoom(payload.userId);
    client.join(room);
    client.emit("subscribed:notifications", { room });

    return { room };
  }

  @SubscribeMessage("subscribe:payment")
  subscribeToPayment(@ConnectedSocket() client: Socket, @MessageBody() payload: PaymentPayload) {
    if (!payload?.paymentId) {
      client.emit("payment:error", { message: "paymentId is required" });
      return;
    }

    const room = this.getPaymentRoom(payload.paymentId);
    client.join(room);
    client.emit("subscribed:payment", { room });

    return { room };
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
