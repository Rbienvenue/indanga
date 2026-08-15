import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { WsGateway } from "src/ws/ws.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly ws: WsGateway,
  ) {}

  async create(data: Prisma.NotificationUncheckedCreateInput) {
    const notification = await this.db.notification.create({ data });
    this.ws.emitToUser(notification.userId, notification);

    return notification;
  }

  async getNotifications(userId: string, data: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = data;
    const where: Prisma.NotificationWhereInput = { userId };

    const [notifications, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    return this.db.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markOneAsRead(userId: string, notificationId: string) {
    const notification = await this.db.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return this.db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { count: result.count };
  }
}
