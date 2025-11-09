export interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  primary_wallet?: Wallet;
  following_number: number;
  followers_number: number;
  is_active: boolean;
  last_account_deactivation: string;
}

interface Wallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserChatWith {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: FollowersList[];
  is_active: boolean;
}

interface FollowersList {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

export interface DirectMemberListProps {
  user_id: string;
  status: string;
  conversationid: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
  wallets: Wallet[];
  isCall: boolean;
  last_seen: string;
  lastMessageAt: string;
}

export interface ServerMemberListProps {
  user_id: string;
  status: string;
  conversationid: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
  wallets: Wallet[];
  isCall: boolean;
  last_seen: string;
}

export interface MemberInServerProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  avatar_ipfs_hash: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: [];
  is_active: boolean;
  wallets: Wallet[];
  __v: number;
  role: string;
  is_muted: boolean;
  joined_at: string;
}
