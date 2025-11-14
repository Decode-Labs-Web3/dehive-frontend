export interface CategoryProps {
  _id: string;
  name: string;
  server_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  channels: ChannelProps[];
}

export interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

export interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  nft_gated?: {
    enabled: boolean;
    network: string;
    chain_id: string;
    contract_address: string;
    required_balance: number;
  };
}
