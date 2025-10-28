// ---- Server -> Client ----
export interface WsErrorPayload {
  message: string;
  code?: string;
  details?: string;
  timestamp?: string;
}

export interface IdentityConfirmed {
  userDehiveId: string;
  status: "online";
}

export interface UserStatusChanged {
  userId: string;
  status: "online" | "offline";
}

export interface ServerToClientStatus {
  error: (data: WsErrorPayload | string) => void;
  identityConfirmed: (data: IdentityConfirmed | string) => void;
  userStatusChanged: (data: UserStatusChanged | string) => void;
}

// ===== Client -> Server =====
export interface ClientToServerStatus {
  identity: (data: { userDehiveId: string; fingerprintHash: string }) => void;
}
