// ===== Server -> Client =====
export interface IdentityConfirmedChannel {
  message: string;
  userDehiveId: string;
}

export interface JoinedServer {
  serverId: string;
  message: string;
}

export interface MessageChannel {
  _id: string;
  channelId: string;
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

export interface ServerToClientChannelChat {
  identityConfirmed: (p: IdentityConfirmedChannel) => void;
  joinedServer: (p: JoinedServer) => void;
  newMessage: (m: MessageChannel) => void;
  messageEdited: (m: MessageChannel) => void;
  messageDeleted: (m: MessageChannel) => void;
  pong: (p: Pong) => void;
  error: (e: WsErrorPayloadChannel) => void;
}




// ===== Client -> Server =====
export interface CreateMessageChannelDto {
  channelId: string;
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

export interface JoinServerDto {
  serverId: string;
}

export interface ClientToServerChannelChat {
  identity: (userDehiveId: string) => void;
  joinServer: (dto: JoinServerDto) => void;
  sendMessage: (dto: CreateMessageChannelDto) => void;
  editMessage: (dto: EditMessageChannelDto) => void;
  deleteMessage: (dto: DeleteMessageChannelDto) => void;
  ping: () => void;
}
