"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faHashtag,
  faVolumeHigh,
  faUserPlus,
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

export default function Channels({ channel }: { channel: ChannelProps }) {
  return (
    <>
      <div
        onContextMenuCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Test Mouse Right click");
          // setCategoryModal((prev) => ({
          //   ...prev,
          //   [category._id]: !prev[category._id],
          // }));
        }}
        className={
          "relative flex items-center justify-between px-4 py-1 rounded-md hover:bg-[var(--background-secondary)] group w-full h-full"
        }
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
      </div>
    </>
  );
}
