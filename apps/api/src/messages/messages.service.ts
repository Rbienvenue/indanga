import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type Message } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { WsGateway } from "src/ws/ws.gateway";
import { conversationAccess, type MessageUser } from "./messages-access";
import type { MessagePaginationDto } from "./dtos";

const conversationInclude = {
  client: { select: { name: true } },
  house: { select: { name: true } },
  booking: { select: { bookingId: true } },
} satisfies Prisma.ConversationInclude;
type ConversationDetails = Prisma.ConversationGetPayload<{ include: typeof conversationInclude }>;

@Injectable()
export class MessagesService {
  constructor(
    private readonly db: PrismaService,
    private readonly ws: WsGateway,
  ) {}

  async getConversation(user: MessageUser, id: string) {
    const conversation = await this.db.conversation.findFirst({
      where: { AND: [{ id }, conversationAccess(user)] },
      include: conversationInclude,
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    return conversation;
  }

  async detail(user: MessageUser, id: string) {
    return this.summary(user, await this.getConversation(user, id));
  }

  async createSupport(user: MessageUser) {
    if (user.role === "admin")
      throw new ForbiddenException("Support conversations are started by clients");
    const conversation = await this.db.conversation.upsert({
      where: { key: `support:${user.id}` },
      create: { key: `support:${user.id}`, type: "SUPPORT", clientId: user.id },
      update: {},
      include: conversationInclude,
    });
    return this.summary(user, conversation);
  }

  async createProperty(user: MessageUser, bookingId: string) {
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, OR: [{ clientId: user.id }, { house: { ownerId: user.id } }] },
      include: { house: { select: { id: true, name: true } } },
    });
    if (!booking || user.role === "admin") throw new NotFoundException("Booking not found");
    const conversation = await this.db.conversation.upsert({
      where: { key: `booking:${bookingId}` },
      create: {
        key: `booking:${bookingId}`,
        type: "PROPERTY",
        clientId: booking.clientId,
        bookingId,
        houseId: booking.house.id,
        propertyName: booking.house.name,
      },
      update: {},
      include: conversationInclude,
    });
    return this.summary(user, conversation);
  }

  async list(user: MessageUser, { page, limit }: MessagePaginationDto) {
    const where = conversationAccess(user);
    const [conversations, total] = await Promise.all([
      this.db.conversation.findMany({
        where,
        include: {
          ...conversationInclude,
          messages: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1 },
          reads: { where: { userId: user.id } },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.conversation.count({ where }),
    ]);
    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const lastReadAt = conversation.reads[0]?.lastReadAt;
        const unreadCount = await this.db.message.count({
          where: {
            conversationId: conversation.id,
            OR: [{ senderId: { not: user.id } }, { senderId: null }],
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        });
        return {
          ...this.summary(user, conversation),
          unreadCount,
          lastMessage: conversation.messages[0]
            ? this.publicMessage(user, conversation, conversation.messages[0])
            : null,
        };
      }),
    );
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getUnreadCount(user: MessageUser) {
    const conversations = await this.db.conversation.findMany({
      where: conversationAccess(user),
      select: { id: true, reads: { where: { userId: user.id }, select: { lastReadAt: true } } },
    });
    if (conversations.length === 0) return { count: 0 };
    const count = await this.db.message.count({
      where: {
        AND: [
          { OR: [{ senderId: { not: user.id } }, { senderId: null }] },
          {
            OR: conversations.map((conversation) => ({
              conversationId: conversation.id,
              ...(conversation.reads[0]
                ? { createdAt: { gt: conversation.reads[0].lastReadAt } }
                : {}),
            })),
          },
        ],
      },
    });
    return { count };
  }

  async history(user: MessageUser, id: string, { page, limit }: MessagePaginationDto) {
    const conversation = await this.getConversation(user, id);
    const [messages, total] = await Promise.all([
      this.db.message.findMany({
        where: { conversationId: id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.message.count({ where: { conversationId: id } }),
    ]);
    return {
      data: messages.map((message) => this.publicMessage(user, conversation, message)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async send(user: MessageUser, id: string, text: string) {
    const conversation = await this.getConversation(user, id);
    const senderType =
      user.id === conversation.clientId
        ? "CLIENT"
        : conversation.type === "SUPPORT"
          ? "SUPPORT"
          : "PROPERTY";
    const message = await this.db.$transaction(async (tx) => {
      // Serialize activity on this thread; createdAt also gives read receipts a stable boundary.
      await tx.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
      const latest = await tx.message.findFirst({
        where: { conversationId: id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      const createdAt = new Date(Math.max(Date.now(), (latest?.createdAt.getTime() ?? 0) + 1));
      await tx.conversation.update({ where: { id }, data: { updatedAt: createdAt } });
      return tx.message.create({
        data: { conversationId: id, senderId: user.id, senderType, text, createdAt },
      });
    });
    await this.ws.emitConversationUpdate(id);
    return this.publicMessage(user, conversation, message);
  }

  async markRead(user: MessageUser, id: string, messageId: string) {
    await this.getConversation(user, id);
    const message = await this.db.message.findFirst({
      where: { id: messageId, conversationId: id },
    });
    if (!message) throw new NotFoundException("Message not found");
    // A delayed request from an older tab must not move the read position backwards.
    await this.db.$transaction(async (tx) => {
      await tx.conversationRead.upsert({
        where: { conversationId_userId: { conversationId: id, userId: user.id } },
        create: { conversationId: id, userId: user.id, lastReadAt: message.createdAt },
        update: {},
      });
      await tx.conversationRead.updateMany({
        where: { conversationId: id, userId: user.id, lastReadAt: { lt: message.createdAt } },
        data: { lastReadAt: message.createdAt },
      });
    });
    return { success: true };
  }

  private summary(user: MessageUser, conversation: ConversationDetails) {
    const propertyName = conversation.house?.name ?? conversation.propertyName ?? "Property";
    return {
      id: conversation.id,
      type: conversation.type,
      displayName:
        user.id === conversation.clientId
          ? conversation.type === "SUPPORT"
            ? "INDANGA Support"
            : propertyName
          : (conversation.client?.name ?? "Former client"),
      propertyName: conversation.type === "PROPERTY" ? propertyName : null,
      bookingReference: conversation.booking?.bookingId ?? null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private publicMessage(user: MessageUser, conversation: ConversationDetails, message: Message) {
    return {
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      isOwnMessage: message.senderId === user.id,
      sender: {
        type: message.senderType,
        displayName:
          message.senderType === "SUPPORT"
            ? "INDANGA Support"
            : message.senderType === "PROPERTY"
              ? (conversation.house?.name ?? conversation.propertyName ?? "Property")
              : (conversation.client?.name ?? "Former client"),
      },
    };
  }
}
