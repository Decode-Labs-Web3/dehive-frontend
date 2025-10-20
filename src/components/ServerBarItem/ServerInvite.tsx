"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { faX, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInviteSuggestions } from "@/hooks/useInviteSuggestions";

interface ServerProps {
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

interface ServerInviteProps {
  server: ServerProps;
  setModal: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function ServerInvite({ server, setModal }: ServerInviteProps) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<number | null>(null);
  const { suggestions } = useInviteSuggestions(server._id);
  const [isSended, setIsSended] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setIsSended(
      Object.fromEntries(
        suggestions.map((suggestion) => [suggestion.user_id, false])
      )
    );
  }, [suggestions]);
  const [sendInvite, setSendInvite] = useState({
    conversationId: "",
    content: "",
    uploadIds: [],
  });
  console.log("sendInvite: ", sendInvite);

  const fetchCode = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          serverId: server._id,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        setCode(response.data.code);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      console.error("Server error create category");
    } finally {
      setLoading(false);
    }
  }, [server._id]);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  const handleSendInvite = async (otherUserDehiveId: string) => {
    if (isSended[otherUserDehiveId]) return;
    setLoading(true);

    try {
      const conversationRes = await fetch(
        "/api/me/conversation/conversation-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({ otherUserDehiveId }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!conversationRes.ok) {
        console.error(conversationRes);
        return;
      }

      const conversation = await conversationRes.json();
      if (conversation.statusCode !== 200) {
        console.error("create conversation failed");
        return;
      }

      const payload = {
        conversationId: conversation.data._id,
        content: `${window.location.origin}${invitePath}`,
        uploadIds: [],
      };
      setSendInvite(payload);

      const sendRes = await fetch("/api/me/conversation/file-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify(payload),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!sendRes.ok) {
        console.error(sendRes);
        return;
      }

      const send = await sendRes.json();
      if (
        send.statusCode === 201 &&
        send.message === "Message sent successfully"
      ) {
        setIsSended((prev) => ({ ...prev, [otherUserDehiveId]: true }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const invitePath = code
    ? `/invite?code=${encodeURIComponent(String(code))}`
    : "";

  if (loading) {
    return <h1>Loading ...</h1>;
  }
  return (
    <div
      role="dialog"
      className="fixed inset-0 flex items-center justify-center z-30"
    >
      <div
        onClick={() => {
          setModal((prev) => ({
            ...prev,
            invite: false,
          }));
        }}
        className="fixed inset-0 bg-black/80 z-40"
      />
      <div className="bg-[#313338] rounded-lg w-full max-w-md z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1e1f22]">
          <div>
            <h2 className="text-white font-semibold text-base">
              Invite friends to {server.name} server
            </h2>
            <div className="flex items-center gap-1 text-[#b5bac1] text-xs mt-1">
              <span>#</span>
              <span>general</span>
            </div>
          </div>
          <button
            onClick={() => {
              setModal((prev) => ({
                ...prev,
                invite: false,
              }));
            }}
            className="text-[#b5bac1] hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faX} className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pb-4 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.user_id}
              className="flex items-center justify-between py-2 hover:bg-[#2b2d31] rounded px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      suggestion
                        ? `https://ipfs.de-id.xyz/ipfs/${suggestion.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={"Avatar"}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {suggestion.display_name}
                  </div>
                  <div className="text-[#b5bac1] text-xs">
                    @{suggestion.username}
                  </div>
                </div>
              </div>
              <button
                disabled={isSended[suggestion.user_id]}
                onClick={() => handleSendInvite(suggestion.user_id)}
                className="bg-transparent border border-[#4e5058] text-white text-sm px-4 py-1.5 rounded hover:bg-[#4e5058] transition-colors"
              >
                {isSended[suggestion.user_id] ? (
                  <>Sended</>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} />
                    Invite
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1e1f22] p-4">
          <div className="text-[#b5bac1] text-xs font-semibold uppercase mb-2">
            Or, send a server invite link to a friend
          </div>
          <div className="flex gap-2">
            <button
              disabled={!code}
              onClick={async (e) => {
                if (!code) return;
                const btn = e.currentTarget;
                const old = btn.textContent;

                const fullUrl = `${window.location.origin}${invitePath}`;
                await navigator.clipboard.writeText(fullUrl);

                btn.textContent = "Copied!";
                setTimeout(() => (btn.textContent = old), 1000);
              }}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {`${window.location.origin}${invitePath}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
