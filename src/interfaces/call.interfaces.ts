export interface CallProps {
  callId: string | null;
  status: "idle" | "ringing" | "calling" | "connected";
  isIncoming: boolean;
  isOutgoing: boolean;
  caller_info: UserInfo | null;
  callee_info: UserInfo | null;
  isTimeout: boolean;
}

interface UserInfo {
  _id: string;
  avatar_ipfs_hash: string;
  username: string;
  display_name: string;
  is_active: boolean;
  status: string;
  bio: string;
}
