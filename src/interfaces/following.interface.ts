export interface FollowingUserItem {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: [];
  mutual_followers_number: number;
}
