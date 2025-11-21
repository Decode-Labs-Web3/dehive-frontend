"use client";

import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useCallback } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ServerProps } from "@/interfaces/server.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInviteSuggestions } from "@/hooks/useInviteSuggestions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServerInviteProps {
  serverInfomation: ServerProps;
  setModal: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function ServerInvite({ serverInfomation, setModal }: ServerInviteProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<number | null>(null);
  const { suggestions } = useInviteSuggestions(serverInfomation._id);
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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          serverId: serverInfomation._id,
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
      }
    } catch (error) {
      console.log(error);
      console.error("Server error create category");
    } finally {
      setLoading(false);
    }
  }, [serverInfomation._id, fingerprintHash]);

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
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
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
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setModal((prev) => ({
            ...prev,
            invite: false,
          }));
        }
      }}
    >
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Invite friends to {serverInfomation.name} server</DialogTitle>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
            <span>#</span>
            <span>general</span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-64">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.user_id}
              className="flex items-center justify-between py-2 hover:bg-accent rounded px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://ipfs.de-id.xyz/ipfs/${suggestion.avatar_ipfs_hash}`}
                  />
                  <AvatarFallback>
                    {suggestion?.display_name} Avatar
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-foreground text-sm font-medium">
                    {suggestion.display_name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    @{suggestion.username}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                disabled={isSended[suggestion.user_id] || loading}
                onClick={() => handleSendInvite(suggestion.user_id)}
              >
                {isSended[suggestion.user_id] ? (
                  <>Sended</>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} />
                    Invite
                  </>
                )}
              </Button>
            </div>
          ))}
        </ScrollArea>

        <div className="border-t border-border pt-4">
          <div className="text-muted-foreground text-xs font-semibold uppercase mb-2">
            Or, send a server invite link to a friend
          </div>
          <Button
            disabled={!code || loading}
            onClick={async (e) => {
              if (!code) return;
              const btn = e.currentTarget;
              const old = btn.textContent;

              const fullUrl = `${window.location.origin}${invitePath}`;
              await navigator.clipboard.writeText(fullUrl);

              btn.textContent = "Copied!";
              setTimeout(() => (btn.textContent = old), 1000);
            }}
          >
            {`${window.location.origin}${invitePath}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
