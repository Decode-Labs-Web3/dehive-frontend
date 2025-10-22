"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import ServerBarItems from "@/components/ServerBarItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
export default function Channels({
  channel,
  channelPanel,
  isPrivileged,
  setChannelPannel,
  fetchCategoryInfo,
}: ChannelPageProps) {
  const { serverId } = useParams();
  const [channelModal, setChannelModal] = useState(false);
  const [deleteChannelModal, setDeleteChannelModal] = useState(false);
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
        <Link
          href={channel.type === "TEXT" ? `/app/channels/${serverId}/${channel._id}` : `/app/channels/${serverId}/${channel._id}/call`}
          className=" flex flex-row justify-between items-center w-full h-full"
        >
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <FontAwesomeIcon
              icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
              className="w-4 h-4 text-[var(--muted-foreground)]"
            />
            <p className="truncate text-sm">{channel.name}</p>
          </div>

          <div className="flex flex-row gap-1">
            <button className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100">
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
            <button className="p-1 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100">
              <FontAwesomeIcon icon={faGear} />
            </button>
          </div>
        </Link>

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

            <div className="absolute top-full z-30 left-1/2 -translate-x-1/2 w-55 rounded-md bg-[var(--background)] text-[var(--foreground)]">
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
                    className="w-full text-left px-3 py-2 hover:bg-[var(--background-secondary)]"
                  >
                    Edit Channel
                  </button>
                  <button
                    onClick={() => {
                      setChannelModal(false);
                      setDeleteChannelModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-red-500 hover:bg-[var(--background-secondary)]"
                  >
                    Delete Channel
                  </button>
                </>
              )}
              <button
                onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
                  const button = event.currentTarget;
                  const oldText = button.textContent;

                  await navigator.clipboard.writeText(channel._id);

                  button.textContent = "Copied!";
                  setTimeout(() => {
                    button.textContent = oldText;
                  }, 1000);
                }}
                className="w-full flex justify-between text-left px-3 py-2 hover:bg-[var(--background-secondary)]"
              >
                Copy Channel ID
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </>
        )}
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
          <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg p-5 w-full max-w-md z-50 shadow-2xl border border-[var(--border-color)]">
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">Delete Channel</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Are you sure you want to delete{" "}
                  <FontAwesomeIcon
                    icon={channel.type === "TEXT" ? faHashtag : faVolumeHigh}
                    className="w-4 h-4 text-[var(--muted-foreground)]"
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
                className="px-3 py-2 rounded-md text-sm bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteChannel(channel._id);
                }}
                className="px-3 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
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
