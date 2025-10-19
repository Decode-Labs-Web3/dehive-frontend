export interface CallProps {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended" | "timeout";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  error: string | null;
}
