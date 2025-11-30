"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function MessageSkeleton() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let animationId: number;
    const scrollSpeed = 5;

    const animate = () => {
      if (element.scrollTop + element.clientHeight === element.scrollHeight) {
        element.scrollTop = 0;
      } else {
        element.scrollTop += scrollSpeed;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <ScrollArea ref={scrollRef} className="flex-1 px-6 py-6 bg-background">
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
        >
          <div className="flex w-full">
            <Skeleton className="w-8 h-8 shrink-0 rounded-full bg-muted" />
            <div className="flex w-full flex-col items-start gap-1 ml-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 bg-muted" />{" "}
                <Skeleton className="h-3 w-16 bg-muted" />{" "}
              </div>
              <Skeleton className="h-4 w-full max-w-md bg-muted" />{" "}
              <Skeleton className="h-4 w-3/4 bg-muted" />
            </div>
          </div>
        </div>
      ))}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
