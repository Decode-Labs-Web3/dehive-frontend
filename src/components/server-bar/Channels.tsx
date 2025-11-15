"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import ServerBarItems from "@/components/server-bar";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useParams, useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint";
import { ChannelProps } from "@/interfaces/server.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faCopy,
  faHashtag,
  faVolumeHigh,
  faVideo,
  faDisplay,
  faVolumeXmark,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelPageProps {
  channel: ChannelProps;
  isPrivileged: boolean;
}

export default function Channels({ channel, isPrivileged }: ChannelPageProps) {
  const router = useRouter();
  const { deleteChannelRoot } = useServerRoot();
  const [channelPanel, setChannelPanel] = useState<boolean>(false);
  const { fingerprintHash } = useFingerprint();
  const { serverId } = useParams<{ serverId: string }>();
  const [deleteChannelModal, setDeleteChannelModal] = useState(false);
  const { serverRoot } = useServerRoot();
  const handleChannelClick = () => {
    console.log("Channel clicked:", channel._id, channel.type);
    if (channel.type === "VOICE") {
      router.push(`/app/channels/${serverId}/${channel._id}/call`);
    } else {
      router.push(`/app/channels/${serverId}/${channel._id}`);
    }
  };

  const [loading, setLoading] = useState(false);
  const userChannel = useMemo(() => {
    const currentChannel = serverRoot
      .flatMap((category) => category.channels)
      .find((ch) => ch._id === channel._id);

    return currentChannel?.participants || [];
  }, [serverRoot, channel._id]);

  const handleDeleteChannel = async (channelId: string) => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/channel/delete", {
        method: "DELETE",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
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
        setChannelPanel(false);
        deleteChannelRoot(channelId);
      }
    } catch (error) {
      console.error(error);
      console.log("Server deleted channel fail");
    } finally {
      setLoading(false);
    }
  };

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
                  {userChannel?.map((user) => (
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
                  console.log("edit channel click trigger channel panel");
                  setChannelPanel(true);
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
        <DialogContent className="max-w-md">
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
              disabled={loading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {channelPanel && (
        <ServerBarItems.ChannelPanel
          channel={channel}
          setChannelPanel={setChannelPanel}
          handleDeleteChannel={handleDeleteChannel}
        />
      )}
    </>
  );
}
