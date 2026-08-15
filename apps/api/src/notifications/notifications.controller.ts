import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { PaginationResponse } from "src/@types";
import { NotificationsService } from "./notifications.service";

class NotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(["tenant", "landlord", "admin"])
  async getNotifications(@Session() session: UserSession, @Query() query: NotificationQueryDto) {
    const result = await this.notificationsService.getNotifications(session.user.id, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("unread-count")
  @Roles(["tenant", "landlord", "admin"])
  async getUnreadCount(@Session() session: UserSession) {
    const count = await this.notificationsService.getUnreadCount(session.user.id);
    return { count };
  }

  @Patch("read-all")
  @Roles(["tenant", "landlord", "admin"])
  async markAllAsRead(@Session() session: UserSession) {
    const result = await this.notificationsService.markAllAsRead(session.user.id);
    return { data: result, success: true, message: "notifications marked as read" };
  }

  @Patch(":id/read")
  @Roles(["tenant", "landlord", "admin"])
  async markOneAsRead(@Session() session: UserSession, @Param("id") notificationId: string) {
    const notification = await this.notificationsService.markOneAsRead(
      session.user.id,
      notificationId,
    );
    return { data: notification, success: true, message: "notification marked as read" };
  }
}
