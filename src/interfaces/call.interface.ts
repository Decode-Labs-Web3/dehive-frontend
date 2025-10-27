export interface CallProps {
  conversation_id: string | null;
  status: "idle" | "ringing" | "calling" | "connected" | "declined" | "ended";
  user_info?: UserInfo | null;
}

type UserInfo = {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
};
