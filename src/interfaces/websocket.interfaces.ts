// ===== Server -> Client (listen) =====
export type IdentityConfirmed = {
  userDehiveId: string;
};

export type NewMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: unknown;
  createdAt: string | Date;
};

export type MessageEdited = {
  _id: string;
  messageId: string;
  conversationId: string;
  content: string;
  isEdited: true;
  editedAt?: string | Date;
};

export type MessageDeleted = {
  _id: string;
  messageId: string;
  conversationId: string;
  isDeleted: true;
};

export type WsErrorPayload = {
  message: string;
  details?: string;
};

// ===== Client -> Server (emit) =====
export type SendDirectMessageDto = {
  conversationId: string;
  content: string;
  uploadIds: string[];
};

export type EditMessageDto = {
  messageId: string;
  content: string;
};

export type DeleteMessageDto = {
  messageId: string;
};

// ===== Event name maps  =====

// server to client
export interface ServerToClientEvents {
  identityConfirmed: (p: IdentityConfirmed) => void;
  newMessage: (m: NewMessage) => void;
  messageEdited: (m: MessageEdited) => void;
  messageDeleted: (m: MessageDeleted) => void;
  error: (e: WsErrorPayload) => void;
}

// client to server
export interface ClientToServerEvents {
  identity: (userDehiveId: string) => void;
  sendMessage: (dto: SendDirectMessageDto) => void;
  editMessage: (dto: EditMessageDto) => void;
  deleteMessage: (dto: DeleteMessageDto) => void;
}
