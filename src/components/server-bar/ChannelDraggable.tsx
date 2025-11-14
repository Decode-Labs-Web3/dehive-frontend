"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import ServerBarItems from "@/components/server-bar";
import { ChannelProps } from "@/interfaces/server.interface";

interface ChannelDraggableProps {
  channel: ChannelProps;
  categoryId: string;
  isPrivileged: boolean;
}

export default function ChannelDraggable({
  channel,
  categoryId,
  isPrivileged,
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
        isPrivileged={isPrivileged}
      />
    </div>
  );
}
