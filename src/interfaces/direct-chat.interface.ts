export interface WalletProps {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DirectUserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
  wallets: WalletProps[];
  status?: string;
}
