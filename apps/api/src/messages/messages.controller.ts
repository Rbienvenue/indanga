import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import {
  CreatePropertyConversationDto,
  MessagePaginationDto,
  ReadConversationDto,
  SendMessageDto,
} from "./dtos";
import { MessagesService } from "./messages.service";

@Controller("messages/conversations")
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Post("support")
  async support(@Session() session: UserSession) {
    return new ApiResponse(await this.messages.createSupport(session.user));
  }

  @Post("property")
  async property(@Session() session: UserSession, @Body() body: CreatePropertyConversationDto) {
    return new ApiResponse(await this.messages.createProperty(session.user, body.bookingId));
  }

  @Get()
  async list(@Session() session: UserSession, @Query() query: MessagePaginationDto) {
    const result = await this.messages.list(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("unread-count")
  async unreadCount(@Session() session: UserSession) {
    return new ApiResponse(await this.messages.getUnreadCount(session.user));
  }

  @Get(":id/messages")
  async history(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Query() query: MessagePaginationDto,
  ) {
    const result = await this.messages.history(session.user, id, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get(":id")
  async detail(@Session() session: UserSession, @Param("id") id: string) {
    return new ApiResponse(await this.messages.detail(session.user, id));
  }

  @Post(":id/messages")
  async send(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: SendMessageDto,
  ) {
    return new ApiResponse(await this.messages.send(session.user, id, body.text));
  }

  @Post(":id/read")
  async read(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: ReadConversationDto,
  ) {
    return new ApiResponse(await this.messages.markRead(session.user, id, body.messageId));
  }
}
