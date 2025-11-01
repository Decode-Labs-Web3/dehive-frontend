"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import ServerBarItems from "@/components/serverBarItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCallSingleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  JoinedServer,
  UserJoinedChannelPayload,
  UserStatusChangedPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";
import {
  faCopy,
  faHashtag,
  faVolumeHigh,
  faVideo,
  faDisplay,
  faVolumeXmark,
  faMicrophoneSlash,
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
    const onServerJoined = (p: JoinedServer) => {
      console.log("[channel call serverJoined] quang minh", p);
      const participants =
        p?.channels?.find(
          (channelItem) => channelItem.channel_id === channel._id
        )?.participants ?? [];

      setUserChannel(participants);
    };
    socket.on("serverJoined", onServerJoined);
    return () => {
      socket.off("serverJoined", onServerJoined);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserJoinedChannel = (p: UserJoinedChannelPayload) => {
      // console.log("[channel call userJoinedChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("[channel call userJoinedChannel]", p);
        setUserChannel((prev) => {
          if (!p.user_info || !p.user_info._id) return prev;
          const exists = prev.some((u) => u._id === p.user_info._id);
          if (exists) return prev;
          return [...prev, p.user_info];
        });
      }
    };
    socket.on("userJoinedChannel", onUserJoinedChannel);
    return () => {
      socket.off("userJoinedChannel", onUserJoinedChannel);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserStatusChanged = (p: UserStatusChangedPayload) => {
      // console.log("[channel call userLeftChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("User status channel", p);
        setUserChannel((prev) => {
          if (!p.user_info || !p.user_info._id) return prev;
          const userIndex = prev.findIndex(
            (oldUser) => oldUser._id === p.user_info._id
          );
          if (userIndex === -1) return prev;

          const next = [...prev];
          next[userIndex] = {
            ...next[userIndex],
            isCamera: !!p.user_info.isCamera,
            isMic: !!p.user_info.isMic,
            isHeadphone: !!p.user_info.isHeadphone,
            isLive: !!p.user_info.isLive,
          };

          return next;
        });
      }
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, [channel._id]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserLeftChannel = (p: UserLeftChannelPayload) => {
      // console.log("[channel call userLeftChannel] quang minh", p);
      if (p.channel_id === channel._id) {
        console.log("User left channel", p);
        const idToRemove = p?.user_info?._id || p.user_id;
        if (!idToRemove) return;

        setUserChannel((prev) =>
          prev.filter((user) => user._id !== idToRemove)
        );
      }
    };
    socket.on("userLeftChannel", onUserLeftChannel);
    return () => {
      socket.off("userLeftChannel", onUserLeftChannel);
    };
  }, [channel._id]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild onClick={handleChannelClick}>
          <div
            className="group flex flex-col items-start justify-start w-full px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleChannelClick();
              }
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
                <FontAwesomeIcon
                  icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                  className="w-4 h-4"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{channel.name}</p>
              </div>
            </div>

            <div className="flex flex-col m-2">
              {channel.type === "VOICE" && (
                <div className="flex flex-col items-center gap-1">
                  {userChannel.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-start justify-start gap-2"
                    >
                      <div className="flex flex-row gap-2">
                        <Avatar className="w-6 h-6 ring-1 ring-background">
                          <AvatarImage
                            src={`https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`}
                            alt={user.display_name || user.username || "avatar"}
                          />
                          <AvatarFallback className="text-xs">
                            {user.display_name?.[0] ??
                              user.username?.[0] ??
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium truncate max-w-[140px]">
                            {user.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row">
                        {!user.isMic && (
                          <FontAwesomeIcon
                            icon={faMicrophoneSlash}
                            title="Microphone off"
                          />
                        )}
                        {!user.isHeadphone && (
                          <FontAwesomeIcon
                            icon={faVolumeXmark}
                            title="Headphones disconnected"
                          />
                        )}
                        {user.isCamera && (
                          <FontAwesomeIcon icon={faVideo} title="Camera on" />
                        )}
                        {user.isLive && (
                          <FontAwesomeIcon icon={faDisplay} title="Live" />
                        )}
                      </div>
                    </div>
                  ))}
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
