"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ServerBarItems from "@/components/serverBarItem";
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
  faGear,
  faHashtag,
  faVolumeHigh,
  faUserPlus,
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
  const [channelModal, setChannelModal] = useState(false);
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
          prev.filter((user) => user._id !== p.user_info._id)
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
          prev.filter((user) => user._id !== p.user_info._id)
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
    setUserChannel(p.channels.find(channelItem => channelItem.channel_id === channel._id)?.participants || []);
    };
    socket.on("serverJoined", onServerJoined);
    return () => {
      socket.off("serverJoined", onServerJoined);
    };
  },[channel._id]);

  return (
    <>
      <div
        onContextMenuCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // console.log("Test Mouse Right click channel modal");
          setChannelModal((prev) => !prev);
        }}
        className={
          "relative flex items-center justify-between px-4 py-1 rounded-md hover:bg-[var(--background-secondary)] group w-full h-full"
        }
      >
        <div
          onMouseDown={handleChannelClick}
          className=" flex flex-row justify-between items-center w-full h-full"
        >
          <div className="flex flex-col items-center gap-3 text-sm text-[var(--muted-foreground)] w-full">
            <div className="flex justify-between items-between w-full">
              <div className="flex gap-2">
                <FontAwesomeIcon
                  icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                  className="w-4 h-4 text-[var(--muted-foreground)]"
                />
                <p className="truncate text-sm">{channel.name}</p>
              </div>

              <div className="flex gap-1">
                <button className="text-[var(--muted-foreground)]">
                  <FontAwesomeIcon icon={faUserPlus} />
                </button>
                <button className="p-1 text-[var(--muted-foreground)]">
                  <FontAwesomeIcon icon={faGear} />
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-start items-start w-full">
              {channel.type === "VOICE" && (
                <>
                  {userChannel.map((user) => (
                    <div key={user._id} className="flex flex-row">
                      <Avatar className="mx-auto mb-4">
                        <AvatarImage
                          src={`https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`}
                        />
                        <AvatarFallback>{user.display_name}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col ml-2">
                        <h1>{user.display_name}</h1>
                        <h1>@{user.username}</h1>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {channelModal && (
            <>
              <div
                tabIndex={-1}
                ref={(element) => element?.focus()}
                onClick={() => setChannelModal(false)}
                onKeyDown={(event) =>
                  event.key === "Escape" && setChannelModal(false)
                }
                className="fixed inset-0 bg-black/50 z-20"
              />

              <div className="absolute top-full z-30 left-1/2 -translate-x-1/2 w-56 rounded-md border border-border bg-background text-foreground shadow-lg">
                {isPrivileged && (
                  <>
                    <button
                      onClick={() => {
                        setChannelPannel((prev) => ({
                          ...prev,
                          [channel._id]: true,
                        }));
                        setChannelModal(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent"
                    >
                      Edit Channel
                    </button>
                    <button
                      onClick={() => {
                        setChannelModal(false);
                        setDeleteChannelModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-destructive hover:bg-destructive/10"
                    >
                      Delete Channel
                    </button>
                  </>
                )}
                <button
                  onClick={async (
                    event: React.MouseEvent<HTMLButtonElement>
                  ) => {
                    const button = event.currentTarget;
                    const oldText = button.textContent;

                    await navigator.clipboard.writeText(channel._id);

                    button.textContent = "Copied!";
                    setTimeout(() => {
                      button.textContent = oldText;
                    }, 1000);
                  }}
                  className="w-full flex justify-between text-left px-3 py-2 hover:bg-accent"
                >
                  Copy Channel ID
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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

      {deleteChannelModal && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(element: HTMLDivElement) => {
            element?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setDeleteChannelModal(false);
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            onClick={() => {
              setDeleteChannelModal(false);
            }}
            className="fixed inset-0 bg-black/50"
          />
          <div className="bg-background text-foreground rounded-lg p-5 w-full max-w-md z-50 shadow-2xl border border-border">
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">Delete Channel</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Are you sure you want to delete{" "}
                  <FontAwesomeIcon
                    icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                    className="w-4 h-4 text-muted-foreground"
                  />{" "}
                  <span className="font-bold">{channel.name}</span>? This action{" "}
                  {"can't"} be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-row justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setDeleteChannelModal(false);
                }}
                className="px-3 py-2 rounded-md text-sm bg-muted text-foreground hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteChannel(channel._id);
                }}
                className="px-3 py-2 rounded-md text-sm bg-destructive text-destructive-foreground hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

{
  /* {channelModal && (
        <div className="absolute left-1/2 -translate-x-1/2  w-55 h-50 z-20">
          <div
            onClick={() => setChannelModal((prev) => !prev)}
            className="fixed -left-10 inset-0 bg-black/50 w-screen h-screen z-30"
          />
          <div className="bg-yellow-200 z-100">
            <button className="w-full text-left px-3 py-2 hover:bg-[var(--background-secondary)]">
              Edit Channel
            </button>

            <button className="w-full text-left px-3 py-2 text-red-500 hover:bg-[var(--background-secondary)]">
              Delete Channel
            </button>
          </div>
        </div>
      )} */
}
