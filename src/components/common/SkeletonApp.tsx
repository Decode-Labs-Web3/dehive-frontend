"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SkeletonApp() {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="flex w-15 relative p-3">
        <aside className="flex flex-col gap-2 w-full h-full bg-background border-r-2 border-border">
          <div className="relative group w-10 h-10 rounded-md bg-secondary">
            <Skeleton className="w-10 h-10 rounded-md" />
          </div>
          <Separator className="mx-auto my-1 w-8 h-1 bg-border" />
          <ScrollArea className="-mx-3">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="relative mb-2 group w-10 h-10 rounded-md ml-3"
              >
                <Skeleton className="w-10 h-10 rounded-md bg-muted" />
                <span className="absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 h-4 bg-blue-500" />
              </div>
            ))}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
          <Skeleton className="w-10 h-10 rounded-md" />
        </aside>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0 flex">
          <div className="w-full h-full bg-background border-r border-border text-foreground overflow-y-auto">
            <div className="flex items-center w-full h-11 px-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground bg-muted border-b border-border">
              <Skeleton className="h-4 w-24" />
            </div>
            <ScrollArea>
              <div className="space-y-2 p-2 pb-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 px-4 py-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-background text-foreground">
            <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
              <Skeleton className="h-6 w-32 mx-auto" />
            </header>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-2 pb-4">
                  {Array.from({ length: 15 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 px-4 py-2"
                    >
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 w-60 h-30 z-10 overflow-visible">
        <Card className="w-full h-full p-3">
          <div className="flex flex-col h-full gap-3">
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 w-full max-w-xs">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
