"use client";

import { Button } from "@/components/ui/button";
import { useDirectCall } from "@/hooks/useDirectCall";
import CallPage from "@/components/common/CallPage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDirectCallContext } from "@/contexts/DirectCallConetext.contexts";

interface UserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
}

export default function DirectCallPage() {
  const router = useRouter();
  const { channelId } = useParams<{ channelId: string }>();
  const [userChatWith, setUserChatWith] = useState<UserChatWith>({
    id: "",
    displayname: "",
    username: "",
    avatar_ipfs_hash: "",
  });

  console.log("this is orther user info", userChatWith);

  const fetchUserChatWith = useCallback(async () => {
    // if (channelId) return;
    try {
      const apiResponse = await fetch("/api/user/chat-with", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ conversationId: channelId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "OK") {
        setUserChatWith(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server get user chat with error");
    }
  }, [channelId]);

  useEffect(() => {
    fetchUserChatWith();
  }, [fetchUserChatWith]);

  const { meCallState, setMeCallState } = useDirectCallContext();
  const { startCall, acceptCall, declineCall, endCall } = useDirectCall(
    userChatWith.id
  );

  return (
    <div className="h-screen flex items-center justify-center bg-background w-full ">
      {meCallState.status === "idle" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center border">
          <Button onClick={startCall}>Start call</Button>
        </div>
      )}

      {meCallState.status === "ended" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center border w-full">
          <h2 className="text-card-foreground text-xl font-semibold mb-4">
            Call Ended
          </h2>
          <p className="text-muted-foreground mb-2">The call has ended</p>
          <p className="text-card-foreground font-medium">
            {meCallState.user_info?.display_name}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            @{meCallState.user_info?.username}
          </p>
          <Avatar className="mx-auto mb-4">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
            />
            <AvatarFallback>
              {meCallState.user_info?.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            onClick={() => {
              setMeCallState({
                conversation_id: null,
                status: "idle",
                user_info: null,
              });
              router.push(`/app/channels/me/${channelId}`);
            }}
          >
            Close
          </Button>
        </div>
      )}

      {meCallState.status === "declined" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center border w-full">
          <h2 className="text-card-foreground text-xl font-semibold mb-4">
            Call Declined
          </h2>
          <p className="text-muted-foreground mb-2">The call was declined</p>
          <p className="text-card-foreground font-medium">
            {meCallState.user_info?.display_name}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            @{meCallState.user_info?.username}
          </p>
          <Avatar className="mx-auto mb-4">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
            />
            <AvatarFallback>
              {meCallState.user_info?.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            onClick={() => {
              setMeCallState({
                conversation_id: null,
                status: "idle",
                user_info: null,
              });
              router.push(`/app/channels/me/${channelId}`);
            }}
          >
            Close
          </Button>
        </div>
      )}

      {meCallState.status === "ringing" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center border w-full">
          <h2 className="text-card-foreground text-xl font-semibold mb-4">
            Incoming Call
          </h2>
          <p className="text-card-foreground font-medium">
            {meCallState.user_info?.display_name}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            @{meCallState.user_info?.username}
          </p>
          <Avatar className="mx-auto mb-4">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
            />
            <AvatarFallback>
              {meCallState.user_info?.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-4 justify-center">
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => acceptCall()}
            >
              Accept
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => declineCall()}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {meCallState.status === "calling" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center w-full">
          <h2 className="text-card-foreground text-xl font-semibold mb-4">
            Calling...
          </h2>
          <p className="text-card-foreground font-medium">
            {meCallState.user_info?.display_name}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            @{meCallState.user_info?.username}
          </p>
          <Avatar className="mx-auto mb-4">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
            />
            <AvatarFallback>
              {meCallState.user_info?.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <Button
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => endCall()}
          >
            End Call
          </Button>
        </div>
      )}

      {meCallState.status === "connected" && (
        <div className="bg-card rounded-lg shadow-md p-6 text-center border w-full">
          <h2 className="text-card-foreground text-xl font-semibold mb-4">
            Connected
          </h2>
          <p className="text-muted-foreground mb-4">
            Call with {meCallState.user_info?.display_name}
          </p>
          {meCallState.conversation_id && (
            <CallPage callId={meCallState.conversation_id} endCall={endCall} />
          )}
        </div>
      )}
    </div>
  );
}
