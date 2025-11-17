export interface UserProfileData {
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
  mutual_followers_list: MutualFollower[];
  is_active: boolean;
  wallets: WalletRecord[];
  __v: number;
  mutual_servers_count: number;
  mutual_servers: MutualServer[];
}

export interface MutualServer {
  server_id: string;
  server_name: string;
}

export interface MutualFollower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

export interface WalletRecord {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
