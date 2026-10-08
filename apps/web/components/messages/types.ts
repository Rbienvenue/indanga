export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  isOwnMessage: boolean;
  sender: { type: "CLIENT" | "SUPPORT" | "PROPERTY"; displayName: string };
};

export type Conversation = {
  id: string;
  type: "SUPPORT" | "PROPERTY";
  displayName: string;
  propertyName: string | null;
  bookingReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationPreview = Conversation & {
  unreadCount: number;
  lastMessage: ChatMessage | null;
};
