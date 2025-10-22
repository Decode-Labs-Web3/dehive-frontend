"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ServerBarItems from "@/components/ServerBarItem";

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChannelDraggableProps {
  channel: ChannelProps;
  categoryId: string;
  fetchCategoryInfo: () => void;
  isPrivileged: boolean;
  channelPanel: Record<string, boolean>;
  setChannelPannel: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function ChannelDraggable({
  channel,
  categoryId,
  fetchCategoryInfo,
  isPrivileged,
  channelPanel,
  setChannelPannel,
}: ChannelDraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: channel._id,
    data: { categoryId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      <ServerBarItems.Channels
        channel={channel}
        channelPanel={channelPanel}
        setChannelPannel={setChannelPannel}
        fetchCategoryInfo={fetchCategoryInfo}
        isPrivileged={isPrivileged}
      />
    </div>
  );
}
