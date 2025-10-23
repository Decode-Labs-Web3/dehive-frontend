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
  call_id: string;
  caller_id: string;
  caller_info?: {
    _id: string;
    username: string;
    display_name: string;
    avatar_ipfs_hash: string;
    bio: string;
    status: string;
    is_active: boolean;
  };
  timestamp: string;
}

export interface CallStartedPayload {
  call_id: string;
  status: string;
  target_user_id: string;
  timestamp: string;
}

export interface CallAcceptedPayload {
  call_id: string;
  callee_id?: string;
  callee_info?: {
    _id: string;
    username: string;
    display_name: string;
    avatar_ipfs_hash: string;
    bio: string;
    status: string;
    is_active: boolean;
  };
  status?: string;
  timestamp: string;
}

export interface CallDeclinedPayload {
  call_id: string;
  callee_id?: string;
  reason?: string;
  status?: string;
  timestamp: string;
}

export interface CallEndedPayload {
  call_id: string;
  ended_by?: string;
  reason?: string;
  duration?: number;
  status?: string;
  timestamp: string;
}

/** DTO client→server */
export interface SignalOfferDto {
  call_id: string;
  offer: RTCSessionDescriptionInit;
  metadata?: unknown;
}

export interface SignalAnswerDto {
  call_id: string;
  answer: RTCSessionDescriptionInit;
  metadata?: unknown;
}

export interface IceCandidateDto {
  call_id: string;
  candidate: RTCIceCandidateInit;
  sdpMLineIndex?: number;
  sdpMid?: string | null;
  metadata?: unknown;
}

/** Server→client versions */
export interface SignalOfferInbound extends SignalOfferDto {
  from_user_id: string;
  timestamp?: string;
}
export interface SignalAnswerInbound extends SignalAnswerDto {
  from_user_id: string;
  timestamp?: string;
}
export interface IceCandidateInbound extends IceCandidateDto {
  from_user_id: string;
  timestamp?: string;
}

export interface CallTimeoutPayload {
  call_id: string;
  status?: string;
  caller_id?: string;
  reason?: string;
  timestamp: string;
}


export interface ServerToClientDirectCall {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (reason: string) => void;
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

export interface ClientToServerDirectCall {
  identity: (userId: string | { userDehiveId: string }) => void;
  startCall: (data: { target_user_id: string }) => void;
  acceptCall: (data: { call_id: string }) => void;
  declineCall: (data: { call_id: string }) => void;
  endCall: (data: { call_id: string }) => void;
  ping: () => void;
}
