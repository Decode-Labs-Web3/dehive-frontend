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
  primary_wallet?: PrimaryWallet;
  following_number: number;
  followers_number: number;
  is_active: boolean;
  last_account_deactivation: string;
}

interface PrimaryWallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: null;
  is_primary: true;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

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
