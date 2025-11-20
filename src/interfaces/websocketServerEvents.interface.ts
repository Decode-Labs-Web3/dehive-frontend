import { ServerProps } from "./server.interface";
import { ServerMemberListProps } from "./user.interface";
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

export interface ServerInfoUpdatedEvent {
  server_id: string;
  name: string;
  description: string;
  timestamp: string | Date;
}

export interface ServerAvatarUpdatedEvent {
  server_id: string;
  avatar_hash: string;
  timestamp: string | Date;
}

export interface ServerTagsUpdatedEvent {
  server_id: string;
  tags: string[];
  timestamp: string | Date;
}

export interface ServerNFTUpdatedEvent {
  server_id: string;
  server: ServerProps;
  timestamp: string | Date;
}

export interface UserKickedEvent {
  serverId: string;
  userId: string;
  serverName?: string;
  reason?: string;
  timestamp?: string | Date;
}

export interface UserBannedEvent {
  serverId: string;
  userId: string;
  serverName?: string;
  reason?: string;
  timestamp?: string | Date;
}

export type MemberInfoJoined = ServerMemberListProps;

export type MemberInfoLeft = { userId: string } | { user_id: string };

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

export interface CategoryDeletedEvent {
  categoryId: string;
}

export interface CategoryCreatedEvent {
  _id: string;
  name: string;
  server_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  channels: unknown[];
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
  category_id?: string;
  position?: number;
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
  categoryId?: string;
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

export interface ServerOwnershipUpdatedEvent {
  server_id: string;
  owner_id: string;
  timestamp: string | Date;
}

export interface ServerToClientServerEvents {
  debug: (d: DebugEvent) => void;
  error: (e: WsErrorPayload | string) => void;
  identityConfirmed: (p: IdentityConfirmedEvent | string) => void;
  serverJoined: (p: ServerJoinedEvent) => void;

  // Level 1: user-level
  "server:deleted": (p: ServerDeletedEvent) => void;
  "server:info-updated": (p: ServerInfoUpdatedEvent) => void;
  "server:avatar-updated": (p: ServerAvatarUpdatedEvent) => void;
  "server:tags-updated": (p: ServerTagsUpdatedEvent) => void;
  "server:nft-updated": (p: ServerNFTUpdatedEvent) => void;
  "server:kicked": (p: UserKickedEvent) => void;
  "server:banned": (p: UserBannedEvent) => void;
  "server:updated-ownership": (p: ServerOwnershipUpdatedEvent) => void;

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
