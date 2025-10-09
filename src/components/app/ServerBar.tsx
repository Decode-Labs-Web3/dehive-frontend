"use client";

import { useParams } from "next/navigation";
import ServerBarItem from "../serverBarItem";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faChevronDown } from "@fortawesome/free-solid-svg-icons";

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

export default function ServerBar() {
  const { serverId } = useParams();
  const [loading, setLoading] = useState(false);
  const [serverSettingModal, setServerSettingModal] = useState(false);
  const [server, setServer] = useState<ServerProps | null>(null);

  const fetchServerInfo = useCallback(async () => {
    setLoading(true);
    setServerSettingModal(false);
    try {
      const apiResponse = await fetch("/api/servers/server-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setServer(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchServerInfo();
  }, [fetchServerInfo]);

  if (loading) {
    return <>loading ...</>;
  }

  return (
    <div className="w-full h-full bg-[var(--background)] border-2 border-[var(--border-color)]">
      <div className="relative bg-gray-500 border-[var-(--foreground)] border-2 p-2 font-bold z-20">
        <button
          onClick={() => setServerSettingModal(true)}
          className="flex w-full items-center justify-between text-[var-(--foreground)]"
        >
          <span>{server?.name}</span>
          <FontAwesomeIcon icon={serverSettingModal ? faX : faChevronDown} />
        </button>

        {serverSettingModal && (
          <>
            <div
              role="presentation"
              tabIndex={-1}
              ref={(el) => el?.focus()}
              onKeyDown={(e) =>
                e.key === "Escape" && setServerSettingModal(false)
              }
              onClick={() => setServerSettingModal(false)}
              className="fixed inset-0 bg-black/50 z-30"
            />

            <div>
              {server && (
                <ServerBarItem.EditModal
                  server={server}
                  setServerSettingModal={setServerSettingModal}
                  fetchServerInfo={fetchServerInfo}
                />
              )}
            </div>
          </>
        )}
      </div>
      <ServerBarItem.Categories />
    </div>
  );
}

// "use client";
// import { useState } from "react";

// type Channel = { id: string; name: string };
// type Category = { id: string; name: string; channels: Channel[] };

// const demo: Category[] = [
//   {
//     id: "welcome",
//     name: "Welcome",
//     channels: [
//       { id: "ch-welcome", name: "welcome" },
//       { id: "ch-intro", name: "introduction" },
//     ],
//   },
//   {
//     id: "general",
//     name: "General",
//     channels: [
//       { id: "ch-chat", name: "chat" },
//       { id: "ch-bot", name: "bot" },
//       { id: "ch-storage", name: "storage" },
//     ],
//   },
// ];

// export default function ChannelSidebar({
//   categories = demo,
// }: {
//   categories?: Category[];
// }) {
//   const [openIds, setOpenIds] = useState<Set<string>>(new Set(categories.map(c => c.id)));

//   const toggle = (id: string) => {
//     setOpenIds(prev => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   return (
//     <aside className="w-ful p-3 text-gray-300">
//       {categories.map(cat => {
//         const open = openIds.has(cat.id);
//         return (
//           <section key={cat.id} className="mb-3">
//             {/* Header */}
//             <button
//               onClick={() => toggle(cat.id)}
//               className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5"
//               aria-expanded={open}
//             >
//               <span className="font-semibold">{cat.name}</span>
//               <svg
//                 className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
//                 viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
//               >
//                 <path d="M7 5l6 5-6 5V5z" />
//               </svg>
//             </button>

//             {/* Channels */}
//             <div className={`overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-60" : "max-h-0"}`}>
//               <ul className="mt-1 space-y-1">
//                 {cat.channels.map(ch => (
//                   <li key={ch.id} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5">
//                     <span className="text-lg leading-none">#</span>
//                     <span className="capitalize">{ch.name}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </section>
//         );
//       })}
//     </aside>
//   );
// }
