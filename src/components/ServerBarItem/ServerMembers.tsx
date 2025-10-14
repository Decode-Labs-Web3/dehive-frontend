"use client";

import Image from "next/image";
import { getCookie } from "@/utils/cookie.utils";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
  createdAt: string;
  updatedAt: string;
  _v: boolean;
}

interface ServerMembersProps {
  server: ServerProps;
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

export default function ServerMembers({ server }: ServerMembersProps) {
  const [memberships, setMemberships] = useState<MembershipsProps[]>([]);
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);
  const fetchServerMember = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId: server._id }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        setMemberships(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Sever error for fetch server membership");
    }
  }, [server]);

  useEffect(() => {
    fetchServerMember();
  }, [fetchServerMember]);

  if (!server) {
    return <div>Loading...</div>;
  }

  return (
    // <div className="space-y-1">
    //   <div className="mb-4">
    //     <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
    //       Members — {memberships.length}
    //     </h3>
    //   </div>

    //   {memberships.map((membership) => (
    //     <div
    //       key={membership._id}
    //       className="flex justify-between items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--surface-hover)]"
    //     >
    //       <div className="flex flex-row w-100">
    //         <div className="flex flex-row gap-2">
    //           <div className="w-8 h-8 rounded-full overflow-hidden">
    //             <Image
    //               src={
    //                 membership
    //                   ? `https://ipfs.de-id.xyz/ipfs/${membership.avatar}`
    //                   : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
    //               }
    //               alt={`${membership.display_name}'s avatar`}
    //               width={32}
    //               height={32}
    //               className="w-full h-full object-contain"
    //               unoptimized
    //             />
    //           </div>

    //           <div className="flex flex-col">
    //             <span className="text-sm font-medium text-[var(--foreground)] truncate">
    //               {membership.display_name}
    //             </span>

    //             <span className="text-xs text-[var(--muted-foreground)] truncate">
    //               @{membership.username}
    //             </span>
    //           </div>

    //           <span className="text-xs text-[var(--muted-foreground)]">
    //             Joined
    //             <br />
    //             {new Date(membership.joined_at).toLocaleDateString()}
    //           </span>
    //           <div>
    //             <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-foreground)] font-medium">
    //               {membership.role.charAt(0).toUpperCase() +
    //                 membership.role.slice(1)}
    //             </span>
    //             {membership.is_muted && (
    //               <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
    //                 MUTED
    //               </span>
    //             )}
    //             {membership.is_banned && (
    //               <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white font-medium">
    //                 BANNED
    //               </span>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //       <button>
    //         <FontAwesomeIcon icon={faEllipsisVertical} />
    //       </button>
    //     </div>
    //   ))}
    // </div>

    <div className="grid grid-cols-2 items-center gap-4 px-3 py-2 w-full">
      <div className="justify-start grid grid-cols-3">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
      <div className="justify-end">4</div>
    </div>
  );
}
