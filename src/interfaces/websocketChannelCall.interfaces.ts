// ===== Server -> Client =====
export interface WsErrorPayload {
  message: string;
  code?:
    | "INVALID_FORMAT"
    | "INVALID_USER_ID"
    | "USER_NOT_FOUND"
    | "AUTHENTICATION_REQUIRED"
    | string;
  details?: string | unknown;
  timestamp: string;
}

export interface PongPayload {
  timestamp: string;
  message: "pong";
}

export interface PublicUserInfo {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
}

export interface IdentityConfirmedCall {
  userDehiveId: string;
  status: "success";
  timestamp: string;
}

export interface ChannelJoinedPayload {
  channel_id: string;
  status: string;
  participants: PublicUserInfo[];
  timestamp: string;
}

export interface UserJoinedChannelPayload {
  channel_id: string;
  user_id: string;
  user_info: PublicUserInfo;
  timestamp: string;
}

export interface ChannelLeftPayload {
  channel_id: string;
  status: string;
  timestamp: string;
}

export interface UserLeftChannelPayload {
  channel_id: string;
  user_id: string;
  timestamp: string;
}

export interface ServerToClientChannelCall {
  identityConfirmed: (p: IdentityConfirmedCall) => void;
  channelJoined: (p: ChannelJoinedPayload) => void;
  userJoinedChannel: (p: UserJoinedChannelPayload) => void;
  channelLeft: (p: ChannelLeftPayload) => void;
  userLeftChannel: (p: UserLeftChannelPayload) => void;
  pong: (p: PongPayload) => void;
  error: (e: WsErrorPayload) => void;
}

// ===== Client -> Server =====
export interface IdentityCallDto {
  userDehiveId: string;
}

export interface JoinChannelDto {
  channel_id: string;
}

export interface LeaveChannelDto {
  channel_id: string;
}

export interface ClientToServerChannelCall {
  identity: (payload: IdentityCallDto | string) => void;
  joinChannel: (dto: JoinChannelDto | string) => void;
  leaveChannel: (dto: LeaveChannelDto | string) => void;
  ping: () => void;
}
