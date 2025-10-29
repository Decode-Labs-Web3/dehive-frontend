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
  timestamp?: string;
}

export interface PongPayload {
  timestamp: string;
  message: "pong";
}

export interface UserInfo {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
  isCamera: boolean;
  isMic: boolean;
  isHeadphone: boolean;
  isLive: boolean;
}

export interface IdentityConfirmedCall {
  userDehiveId: string;
  status: "success";
  timestamp?: string;
}

export interface JoinedServer {
  server_id: string;
  status?: string;
  channels: Channels[];
}

export interface Channels {
  channel_id: string;
  participants: UserInfo[];
}

export interface UserJoinedChannelPayload {
  channel_id: string;
  user_id: string;
  user_info: UserInfo;
}

export interface UserLeftChannelPayload {
  channel_id: string;
  user_id: string;
  user_info?: UserInfo;
}

export interface UserStatusChangedPayload {
  channel_id: string;
  user_info: UserInfo;
}

export interface ServerToClientChannelCall {
  pong: (p: PongPayload) => void;
  error: (e: WsErrorPayload) => void;
  serverJoined: (p: JoinedServer) => void;
  identityConfirmed: (p: IdentityConfirmedCall) => void;
  userLeftChannel: (p: UserLeftChannelPayload) => void;
  userJoinedChannel: (p: UserJoinedChannelPayload) => void;
  userStatusChanged: (p: UserStatusChangedPayload) => void;
}

// ===== Client -> Server =====
export interface IdentityCallDto {
  userDehiveId: string;
}

export interface JoinServerDto {
  server_id: string;
}

export interface JoinChannelDto {
  channel_id: string;
}

export interface LeaveChannelDto {
  channel_id: string;
}

export interface UpdateUserStatusDto {
  isCamera?: boolean;
  isMic?: boolean;
  isHeadphone?: boolean;
  isLive?: boolean;
}

export interface ClientToServerChannelCall {
  joinServer: (dto: JoinServerDto) => void;
  joinChannel: (dto: JoinChannelDto) => void;
  identity: (payload: IdentityCallDto) => void;
  leaveChannel: (dto: LeaveChannelDto) => void;
  updateUserStatus: (payload: UpdateUserStatusDto) => void;
}
