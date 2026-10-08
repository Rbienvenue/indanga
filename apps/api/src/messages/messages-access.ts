import type { Prisma } from "@indanga/db";

export type MessageUser = { id: string; role?: string | string[] | null };

// Shared by HTTP and realtime so both enforce the same conversation boundary.
export function conversationAccess(user: MessageUser): Prisma.ConversationWhereInput {
  if (user.role === "admin") return { type: "SUPPORT" };
  if (user.role === "landlord") {
    return {
      OR: [
        { clientId: user.id, type: "SUPPORT" },
        { type: "PROPERTY", house: { ownerId: user.id } },
      ],
    };
  }
  return { clientId: user.id };
}
