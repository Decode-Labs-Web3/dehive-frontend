// ===== Server -> Client =====
export interface DebugEvent {
  message: string;
}

export interface WsErrorPayload {
  message: string;
  code?: string;
}

export interface IdentityConfirmedEvent {
  message: string;
  userId: string;
}

export interface ServerJoinedEvent {
  message: string;
  serverId: string;
  status: "success" | string;
}

export interface ServerDeletedEvent {
  serverId: string;
  serverName: string;
  timestamp: string | Date;
}

export interface ServerUpdatedEvent {
  serverId: string;
  updates: {
    name?: string;
    description?: string;
    avatar?: string | null;
    [key: string]: unknown;
  };
  timestamp: string | Date;
}

export interface UserKickedEvent {
  serverId: string;
  serverName: string;
  reason?: string;
  timestamp: string | Date;
}

export interface UserBannedEvent {
  serverId: string;
  serverName: string;
  reason?: string;
  timestamp: string | Date;
}

export interface MemberInfoJoined {
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

export interface MemberInfoLeft {
  userId: string;
  username: string;
  displayName: string;
}

export interface MemberJoinedEvent {
  serverId: string;
  member: MemberInfoJoined;
  timestamp: string | Date;
}

export interface MemberLeftEvent {
  serverId: string;
  member: MemberInfoLeft;
  timestamp: string | Date;
}

export interface Category {
  _id: string;
  name: string;
  position?: number;
}

export interface CategoryUpdated extends Partial<Category> {
  _id: string;
  [key: string]: unknown;
}

export interface CategoryDeletedEvent {
  serverId: string;
  categoryId: string;
  categoryName: string;
  timestamp: string | Date;
}

export interface CategoryCreatedEvent {
  serverId: string;
  category: Category;
  timestamp: string | Date;
}

export interface CategoryUpdatedEvent {
  categoryId: string;
  name: string;
}

export interface Channel {
  _id: string;
  name: string;
  type: string;
  categoryId: string;
  position?: number;
}

export interface ChannelUpdated {
  _id: string;
  name?: string;
  type?: string;
  topic?: string;
  [key: string]: unknown;
}

export interface ChannelMoved {
  _id: string;
  name: string;
  oldCategoryId: string;
  newCategoryId: string;
}

export interface ChannelCreatedEvent {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChannelUpdatedEvent {
  _id: string;
  name: string;
}

export interface ChannelDeletedEvent {
  channelId: string;
}

export interface ChannelMovedEvent {
  serverId: string;
  channel: ChannelMoved;
  timestamp: string | Date;
}

export interface ServerToClientServerEvents {
  debug: (d: DebugEvent) => void;
  error: (e: WsErrorPayload | string) => void;
  identityConfirmed: (p: IdentityConfirmedEvent | string) => void;
  serverJoined: (p: ServerJoinedEvent) => void;

  // Level 1: user-level
  "server:deleted": (p: ServerDeletedEvent) => void;
  "server:updated": (p: ServerUpdatedEvent) => void;
  "server:kicked": (p: UserKickedEvent) => void;
  "server:banned": (p: UserBannedEvent) => void;

  // Level 2: server-level
  "member:joined": (p: MemberJoinedEvent) => void;
  "member:left": (p: MemberLeftEvent) => void;
  "category:created": (p: CategoryCreatedEvent) => void;
  "category:updated": (p: CategoryUpdatedEvent) => void;
  "category:deleted": (p: CategoryDeletedEvent) => void;
  "channel:created": (p: ChannelCreatedEvent) => void;
  "channel:updated": (p: ChannelUpdatedEvent) => void;
  "channel:deleted": (p: ChannelDeletedEvent) => void;
  "channel:moved": (p: ChannelMovedEvent) => void;
}

// ===== Client -> Server =====
export interface JoinServerReq {
  serverId: string;
}

export interface ClientToServerServerEvents {
  identity: (userId: string | { userId: string }) => void;
  joinServer: (req: JoinServerReq | string) => void;
}
