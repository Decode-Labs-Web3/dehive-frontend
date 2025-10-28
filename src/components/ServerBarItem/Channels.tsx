"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ServerBarItems from "@/components/serverBarItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCall";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  JoinedServer,
  ChannelLeftPayload,
  ChannelJoinedPayload,
  UserLeftChannelPayload,
  UserJoinedChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";
import {
  faHashtag,
  faVolumeHigh,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChannelPageProps {
  channel: ChannelProps;
  fetchCategoryInfo: () => void;
  isPrivileged: boolean;
  channelPanel: Record<string, boolean>;
  setChannelPannel: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

interface UserChannelProps {
  _id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
  isCamera: boolean;
  isMic: boolean;
  isHeadphone: boolean;
  isLive: boolean;
}

export default function Channels({
  channel,
  channelPanel,
  isPrivileged,
  setChannelPannel,
  fetchCategoryInfo,
}: ChannelPageProps) {
  const { serverId } = useParams();
  const router = useRouter();
  const [deleteChannelModal, setDeleteChannelModal] = useState(false);
  const [userChannel, setUserChannel] = useState<UserChannelProps[]>([]);

  const handleChannelClick = () => {
    console.log("Channel clicked:", channel._id, channel.type);
    if (channel.type === "VOICE") {
      router.push(`/app/channels/${serverId}/${channel._id}/call`);
    } else {
      router.push(`/app/channels/${serverId}/${channel._id}`);
    }
  };
  const handleDeleteChannel = async (channelId: string) => {
    try {
      const apiResponse = await fetch("/api/servers/channel/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ channelId }),
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
        setDeleteChannelModal(false);
        setChannelPannel((prev) => ({
          ...prev,
          [channel._id]: false,
        }));
        fetchCategoryInfo?.();
      }
    } catch (error) {
      console.error(error);
      console.log("Server deleted channel fail");
    }
  };

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onChannelJoined = (p: ChannelJoinedPayload) => {
      // console.log("[channel call channelJoined] quang minh", p);
      console.log(
        "Setting userChannel state with participants:",
        p.participants
      );
      if (p.channel_id === channel._id) {
        console.log(
          "Setting userChannel state with participants:",
          p.participants
        );
        setUserChannel(p.participants);
      }
    };
    socket.on("channelJoined", onChannelJoined);
    return () => {
      socket.off("channelJoined", onChannelJoined);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserJoinedChannel = (p: UserJoinedChannelPayload) => {
      // console.log("[channel call userJoinedChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("[channel call userJoinedChannel]", p);
        setUserChannel((prev) => [...prev, p.user_info]);
      }
    };
    socket.on("userJoinedChannel", onUserJoinedChannel);
    return () => {
      socket.off("userJoinedChannel", onUserJoinedChannel);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserLeftChannel = (p: UserLeftChannelPayload) => {
      // console.log("[channel call userLeftChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("User left channel", p);
        setUserChannel((prev) =>
          prev.filter((user) => user._id !== p?.user_info?._id)
        );
      }
    };
    socket.on("userLeftChannel", onUserLeftChannel);
    return () => {
      socket.off("userLeftChannel", onUserLeftChannel);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onChannelLeft = (p: ChannelLeftPayload) => {
      // console.log("[channel call userLeftChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("User left channel", p);
        setUserChannel((prev) =>
          prev.filter((user) => user._id !== p?.user_info?._id)
        );
      }
    };
    socket.on("channelLeft", onChannelLeft);
    return () => {
      socket.off("channelLeft", onChannelLeft);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onServerJoined = (p: JoinedServer) => {
      // console.log("[channel call serverJoined] quang minh", p);
      setUserChannel(
        p.channels.find((channelItem) => channelItem.channel_id === channel._id)
          ?.participants || []
      );
    };
    socket.on("serverJoined", onServerJoined);
    return () => {
      socket.off("serverJoined", onServerJoined);
    };
  }, [channel._id]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild onClick={handleChannelClick}>
          <div className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer select-none">
            <div className="flex items-center gap-3 truncate">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
                <FontAwesomeIcon
                  icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                  className="w-4 h-4"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{channel.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {channel.type === "VOICE"
                    ? `${userChannel.length} listening`
                    : "Text channel"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {channel.type === "VOICE" && (
                <div className="flex -space-x-2 items-center">
                  {userChannel.slice(0, 3).map((u) => (
                    <Avatar
                      key={u._id}
                      className="w-6 h-6 ring-1 ring-background"
                    >
                      <AvatarImage
                        src={`https://ipfs.de-id.xyz/ipfs/${u.avatar_ipfs_hash}`}
                      />
                      <AvatarFallback className="text-xs">
                        {u.display_name}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {userChannel.length > 3 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      +{userChannel.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {isPrivileged && (
            <>
              <ContextMenuItem
                onClick={() => {
                  console.log("edit channel click trigger channel pannel");
                  setChannelPannel((prev) => ({
                    ...prev,
                    [channel._id]: true,
                  }));
                }}
                className="w-full text-left px-3 py-2 hover:bg-accent"
              >
                Edit Channel
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  console.log("delete channel click");
                  setDeleteChannelModal(true);
                }}
                className="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10"
              >
                Delete Channel
              </ContextMenuItem>
            </>
          )}

          <ContextMenuItem
            onClick={async () => {
              console.log("copy channel id click");
              await navigator.clipboard.writeText(channel._id);
            }}
            className="w-full flex justify-between text-left px-3 py-2 hover:bg-accent"
          >
            Copy Channel ID
            <FontAwesomeIcon icon={faCopy} />
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={deleteChannelModal} onOpenChange={setDeleteChannelModal}>
        <DialogContent className="z-[1000] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete{" "}
              <FontAwesomeIcon
                icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                className="w-4 h-4 text-muted-foreground"
              />{" "}
              <span className="font-bold">{channel.name}</span>? This action{" "}
              {"can't"} be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                console.log("cancel delete channel");
                setDeleteChannelModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                console.log("confirm delete channel");
                handleDeleteChannel(channel._id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {channelPanel[channel._id] && (
        <>
          <ServerBarItems.ChannelPannel
            channel={channel}
            setChannelPannel={setChannelPannel}
            fetchCategoryInfo={fetchCategoryInfo}
            handleDeleteChannel={handleDeleteChannel}
          />
        </>
      )}
    </>
  );
}
