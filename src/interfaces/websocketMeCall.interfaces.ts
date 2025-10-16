export interface WsErrorPayload {
  message: string;
  code?: string;
  details?: string | Record<string, unknown>;
  timestamp?: string;
}

export interface IdentityConfirmed {
  userDehiveId: string;
  status?: "success";
  timestamp?: string;
}

export interface IncomingCallPayload {
  call_id: string;
  caller_id: string;
  caller_info?: unknown;
  with_video: boolean;
  with_audio: boolean;
  timestamp?: string;
}

export interface CallStartedPayload {
  call_id: string;
  status?: string;
  target_user_id: string;
  timestamp?: string;
}

export interface CallAcceptedPayload {
  call_id: string;
  callee_id?: string;
  callee_info?: unknown;
  with_video?: boolean;
  with_audio?: boolean;
  status?: string;
  timestamp?: string;
}

export interface CallDeclinedPayload {
  call_id: string;
  callee_id?: string;
  reason?: string;
  timestamp?: string;
}

export interface CallEndedPayload {
  call_id: string;
  ended_by?: string;
  reason?: string;
  duration?: number;
  status?: string;
  timestamp?: string;
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

export interface ToggleMediaDto {
  call_id: string;
  media_type: "audio" | "video";
  state: "enabled" | "disabled";
}

export interface ToggleMediaInbound extends ToggleMediaDto {
  user_id?: string;
  timestamp?: string;
}

// ===== Event name maps =====

// server -> client
export interface ServerToClientCallEvents {
  identityConfirmed: (p: IdentityConfirmed) => void;

  incomingCall: (p: IncomingCallPayload) => void;
  callStarted: (p: CallStartedPayload) => void;
  callAccepted: (p: CallAcceptedPayload) => void;
  callDeclined: (p: CallDeclinedPayload) => void;
  callEnded: (p: CallEndedPayload) => void;

  signalOffer: (data: SignalOfferInbound) => void;
  signalAnswer: (data: SignalAnswerInbound) => void;
  iceCandidate: (data: IceCandidateInbound) => void;

  mediaToggled: (data: ToggleMediaInbound) => void;

  pong: (p: { timestamp: string; message: string }) => void;
  error: (e: WsErrorPayload) => void;
}

// client -> server
export interface ClientToServerCallEvents {
  identity: (userDehiveId: string) => void;

  startCall: (data: {
    target_user_id: string;
    with_video?: boolean;
    with_audio?: boolean;
  }) => void;

  acceptCall: (data: {
    call_id: string;
    with_video?: boolean;
    with_audio?: boolean;
  }) => void;

  declineCall: (data: { call_id: string }) => void;
  endCall: (data: { call_id: string }) => void;

  signalOffer: (data: SignalOfferDto) => void;
  signalAnswer: (data: SignalAnswerDto) => void;
  iceCandidate: (data: IceCandidateDto) => void;

  toggleMedia: (data: ToggleMediaDto) => void;

  ping?: () => void;
}
