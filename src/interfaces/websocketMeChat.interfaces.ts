// ===== Server -> Client (listen) =====
export interface IdentityConfirmed {
  userDehiveId: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  attachments: [];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: ReplyMessage | null;
  createdAt: string;
  updatedAt: string;
  __v?: number | 0;
}

interface Sender {
  dehive_id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string | null;
}

interface ReplyMessage {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface WsErrorPayload {
  message: string;
  details?: string;
}

// ===== Client -> Server (emit) =====
export interface SendDirectMessageDto {
  conversationId: string;
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}

export interface EditMessageDto {
  messageId: string;
  content: string;
}

export interface DeleteMessageDto {
  messageId: string;
}

// ===== Event name maps  =====

// server to client
export interface ServerToClientMeEvents {
  identityConfirmed: (p: IdentityConfirmed) => void;
  newMessage: (m: Message) => void;
  messageEdited: (m: Message) => void;
  messageDeleted: (m: Message) => void;
  error: (e: WsErrorPayload) => void;
}

// client to server
export interface ClientToServerMeEvents {
  identity: (userDehiveId: string) => void;
  sendMessage: (dto: SendDirectMessageDto) => void;
  editMessage: (dto: EditMessageDto) => void;
  deleteMessage: (dto: DeleteMessageDto) => void;
}
