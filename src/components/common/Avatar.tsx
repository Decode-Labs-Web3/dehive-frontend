"use client";

import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarComponentProps {
  avatar_ipfs_hash?: string;
  displayname?: string;
  status?: string;
}

export default function AvatarComponent({
  avatar_ipfs_hash,
  displayname,
  status,
}: AvatarComponentProps) {
  return (
    <div className="w-10 h-10 flex items-end">
      <Avatar className="w-8 h-8">
        <AvatarImage src={`https://ipfs.de-id.xyz/ipfs/${avatar_ipfs_hash}`} />
        <AvatarFallback>{displayname} Avatar</AvatarFallback>
      </Avatar>
      <FontAwesomeIcon
        icon={faCircle}
        className={`text-[8px] ${
          status === "online" ? "text-emerald-500" : "text-gray-400"
        } ml-[-6px] mb-[2px]`}
      />
    </div>
  );
}
