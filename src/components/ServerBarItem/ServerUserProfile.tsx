"use client";

interface ServerUserProfileProps {
  membership: MembershipsProps;
}

interface MembershipsProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  role: string;
  is_muted: boolean;
  joined_at: string;
}

export default function ServerUserProfile({
  membership,
}: ServerUserProfileProps) {
  return (
    <div className="bg-red-500">
      <h1>Hello this is ServerUserProfile</h1>
      <h1>{membership.display_name}</h1>
    </div>
  );
}
