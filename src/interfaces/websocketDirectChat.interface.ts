// ===== Server -> Client =====
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

export interface ConversationUpdate {
  type: string;
  data: ConversationUpdateData;
}

interface ConversationUpdateData {
  conversationId: string;
  status: "online" | "offline";
  isCall: boolean;
  lastMessageAt: string;
}

export interface ServerToClientDirectChat {
  identityConfirmed: (p: IdentityConfirmed) => void;
  newMessage: (m: Message) => void;
  messageEdited: (m: Message) => void;
  messageDeleted: (m: Message) => void;
  error: (e: WsErrorPayload) => void;
  conversation_update: (p: ConversationUpdate) => void;
}

// ===== Client -> Server =====
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

export interface ClientToServerDirectChat {
  identity: (userDehiveId: string) => void;
  sendMessage: (dto: SendDirectMessageDto) => void;
  editMessage: (dto: EditMessageDto) => void;
  deleteMessage: (dto: DeleteMessageDto) => void;
}
