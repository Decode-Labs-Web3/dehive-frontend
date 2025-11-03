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
  const safeListeners = isPrivileged
    ? (() => {
        const maybe = listeners as unknown as Record<string, unknown>;
        const originalOnPointerDown = maybe.onPointerDown;

        const onPointerDown = (
          e: PointerEvent & { button?: number; shiftKey?: boolean }
        ) => {
          if (e?.button === 2 || e?.button === 1) return;
          if (e?.button !== 0) return;
          if (!e.shiftKey) return;
          if (typeof originalOnPointerDown === "function") {
            (originalOnPointerDown as (ev: PointerEvent) => void)(
              e as PointerEvent
            );
          }
        };

        return {
          ...(listeners as object),
          onPointerDown,
        } as Record<string, unknown>;
      })()
    : ({} as Record<string, unknown>);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      {...(isPrivileged ? (safeListeners as object) : {})}
      {...(isPrivileged ? attributes : {})}
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
