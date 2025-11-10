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

export interface ChannelMemberListProps {
  _id: string;
  name: string;
  type: "VOICE" | "TEXT";
  category_id: string;
  createdAt: string;
  updatedAt: string;
  category_name: string;
  participants?: UserInfoCall[];
}

interface UserInfoCall {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
  isCamera: boolean;
  isMic: boolean;
  isHeadphone: boolean;
  isLive: boolean;
}
