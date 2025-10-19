// ===== Server -> Client (listen) =====
export interface IdentityConfirmedChannel {
  message: string;
  userDehiveId: string;
}

export interface JoinedChannel {
  conversationId: string;
  message: string;
}

export interface MessageChannel {
  _id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  attachments: unknown[];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: ReplyMessage | null;
  createdAt: string | Date;
  updatedAt: string | Date;
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

export interface WsErrorPayloadChannel {
  message: string;
  details?: string | unknown;
}

export interface Pong {
  timestamp: string;
  message: string;
}

// ===== Client -> Server (emit) =====
export interface CreateMessageChannelDto {
  conversationId: string;
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}

export interface EditMessageChannelDto {
  messageId: string;
  content: string;
}

export interface DeleteMessageChannelDto {
  messageId: string;
}

export interface JoinChannelDto {
  serverId: string;
  channelId: string;
}

// ===== Event name maps  =====

// server to client
export interface ServerToClientChannelEvents {
  identityConfirmed: (p: IdentityConfirmedChannel) => void;
  joinedChannel: (p: JoinedChannel) => void;
  newMessage: (m: MessageChannel) => void;
  messageEdited: (m: MessageChannel) => void;
  messageDeleted: (m: MessageChannel) => void;
  pong: (p: Pong) => void;
  error: (e: WsErrorPayloadChannel) => void;
}

// client to server
export interface ClientToServerChannelEvents {
  identity: (userDehiveId: string) => void;
  joinChannel: (dto: JoinChannelDto) => void;
  sendMessage: (dto: CreateMessageChannelDto) => void;
  editMessage: (dto: EditMessageChannelDto) => void;
  deleteMessage: (dto: DeleteMessageChannelDto) => void;
  ping: () => void;
}
