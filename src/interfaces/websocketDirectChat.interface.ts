// ===== Server -> Client =====
export interface IdentityConfirmed {
  userDehiveId: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  attachments: Attachment[];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: ReplyMessage | null;
  createdAt: string;
  updatedAt: string;
  __v?: number | 0;
}

interface Attachment {
  type: "image" | "video" | "audio" | "file";
  ipfsHash: string;
  name: string;
  size: number;
  mimeType: string;
}

interface Sender {
  dehive_id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string | null;
  wallets: Wallet[];
}

interface Wallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
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
