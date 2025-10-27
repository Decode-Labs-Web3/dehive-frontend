// ---- Server -> Client ----
type UserInfo = {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
};

export interface WsErrorPayload {
  message: string;
  code?: string;
  details?: string;
  timestamp?: string;
}

export interface IdentityConfirmed {
  userDehiveId: string;
  status: "success";
  timestamp?: string;
}

export interface IncomingCallPayload {
  conversation_id: string;
  status: "ringing";
  user_info: UserInfo;
}

export interface CallStartedPayload {
  conversation_id: string;
  status: "calling";
  user_info: UserInfo;
}

export interface CallAcceptedPayload {
  conversation_id: string;
  status: "connected";
  user_info: UserInfo;
}

export interface CallDeclinedPayload {
  conversation_id: string;
  status: "declined";
  user_info: UserInfo;
}

export interface CallEndedPayload {
  conversation_id: string;
  status: "ended";
  user_info: UserInfo;
}

export interface CallTimeoutPayload {
  conversation_id: string;
  status: "ended";
  user_info: UserInfo;
}

export interface ServerToClientDirectCall {
  error: (data: WsErrorPayload) => void;
  identityConfirmed: (data: IdentityConfirmed) => void;
  incomingCall: (data: IncomingCallPayload) => void;
  callStarted: (data: CallStartedPayload) => void;
  callAccepted: (data: CallAcceptedPayload) => void;
  callDeclined: (data: CallDeclinedPayload) => void;
  callEnded: (data: CallEndedPayload) => void;
  callTimeout: (data: CallTimeoutPayload) => void;
  pong: (data: { timestamp: string; message: "pong" }) => void;
}

// ===== Client -> Server =====
export interface SignalOfferDto {
  conversation_id: string;
  offer: RTCSessionDescriptionInit;
  metadata?: unknown;
}

export interface SignalAnswerDto {
  conversation_id: string;
  answer: RTCSessionDescriptionInit;
  metadata?: unknown;
}

export interface IceCandidateDto {
  conversation_id: string;
  candidate: RTCIceCandidateInit;
  sdpMLineIndex?: number;
  sdpMid?: string | null;
  metadata?: unknown;
}

export interface ClientToServerDirectCall {
  identity: (userId: string | { userDehiveId: string }) => void;
  startCall: (data: { target_user_id: string }) => void;
  acceptCall: (data: { conversation_id: string }) => void;
  declineCall: (data: { conversation_id: string }) => void;
  endCall: (data: { conversation_id: string }) => void;
  ping: () => void;
}
