// ===== Server -> Client (listen) =====
export type IdentityConfirmed = {
  userDehiveId: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: [];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: ReplyMessage | null;
  createdAt: string;
  updatedAt: string;
  __v?: number | 0;
};

interface ReplyMessage {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export type WsErrorPayload = {
  message: string;
  details?: string;
};

// ===== Client -> Server (emit) =====
export type SendDirectMessageDto = {
  conversationId: string;
  content: string;
  uploadIds: string[];
  replyTo: string | null;
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
  newMessage: (m: Message) => void;
  messageEdited: (m: Message) => void;
  messageDeleted: (m: Message) => void;
  error: (e: WsErrorPayload) => void;
}

// client to server
export interface ClientToServerEvents {
  identity: (userDehiveId: string) => void;
  sendMessage: (dto: SendDirectMessageDto) => void;
  editMessage: (dto: EditMessageDto) => void;
  deleteMessage: (dto: DeleteMessageDto) => void;
}
