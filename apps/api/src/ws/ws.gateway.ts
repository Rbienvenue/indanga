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

  emitToUser(userId: string, notification: unknown) {
    this.server.to(this.getUserRoom(userId)).emit("notification", notification);
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }
}
