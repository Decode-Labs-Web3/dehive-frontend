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
  _v: boolean;
}
