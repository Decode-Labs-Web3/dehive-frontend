"use client";

import { Button } from "@/components/ui/button";
import { useDirectCall } from "@/hooks/useDirectCall";
import MeCallPage from "@/components/common/CallPage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDirectCallContext } from "@/contexts/DirectCallConetext.contexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
}

export default function CallPage() {
  const router = useRouter();
  const { channelId } = useParams<{ channelId: string }>();
  const [userChatWith, setUserChatWith] = useState<UserChatWith>({
    id: "",
    displayname: "",
    username: "",
    avatar_ipfs_hash: "",
  });

  const fetchUserChatWith = useCallback(async () => {
    if (channelId) return;
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
    <div className="h-screen flex items-center justify-center">
      {meCallState.status === "idle" && (
        <Card>
          <CardContent className="text-center p-6">
            <Button onClick={startCall}>Start call</Button>
          </CardContent>
        </Card>
      )}

      {meCallState.status === "ended" && (
        <Card>
          <CardHeader>
            <CardTitle>Call End</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>The call request has ended</p>
            <p>{meCallState.user_info?.display_name}</p>
            <p>{meCallState.user_info?.username}</p>
            <Avatar>
              <AvatarImage
                src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
              />
              <AvatarFallback>
                {meCallState.user_info?.display_name} Avatar
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => {
                setMeCallState({
                  call_id: null,
                  status: "idle",
                  user_info: null,
                });
                router.push(`/app/channels/me/${channelId}`);
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {meCallState.status === "declined" && (
        <Card>
          <CardHeader>
            <CardTitle>Call Declined</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>The call request has been declined</p>
            <p>{meCallState.user_info?.display_name}</p>
            <p>{meCallState.user_info?.username}</p>
            <Avatar>
              <AvatarImage
                src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
              />
              <AvatarFallback>
                {meCallState.user_info?.display_name} Avatar
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => {
                setMeCallState({
                  call_id: null,
                  status: "idle",
                  user_info: null,
                });
                router.push(`/app/channels/me/${channelId}`);
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {meCallState.status === "ringing" && (
        <Card>
          <CardHeader>
            <CardTitle>Incoming Call</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{meCallState.user_info?.display_name}</p>
            <p>{meCallState.user_info?.username}</p>
            <Avatar>
              <AvatarImage
                src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
              />
              <AvatarFallback>
                {meCallState.user_info?.display_name} Avatar
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-success text-success-foreground hover:opacity-90"
                onClick={() => acceptCall()}
              >
                Accept
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:opacity-90"
                onClick={() => declineCall()}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {meCallState.status === "calling" && (
        <Card>
          <CardHeader>
            <CardTitle>Calling...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{meCallState.user_info?.display_name}</p>
            <p>{meCallState.user_info?.username}</p>
            <Avatar>
              <AvatarImage
                src={`https://ipfs.de-id.xyz/ipfs/${meCallState.user_info?.avatar_ipfs_hash}`}
              />
              <AvatarFallback>
                {meCallState.user_info?.display_name} Avatar
              </AvatarFallback>
            </Avatar>
            <Button
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={() => endCall()}
            >
              End Call
            </Button>
          </CardContent>
        </Card>
      )}

      {meCallState.status === "connected" && (
        <Card>
          <CardHeader>
            <CardTitle>Connected</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Call ID: {meCallState.user_info?.display_name}</p>
            {meCallState.call_id && (
              <MeCallPage callId={meCallState.call_id} endCall={endCall} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
