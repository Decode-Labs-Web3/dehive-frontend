"use client";

import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useCallback, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AttachmentType } from "@/constants/attachment.constant";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ServerMessageFileListProps } from "@/interfaces/message.interface";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  faFile,
  faImage,
  faFileAudio,
  faFolderOpen,
  faClapperboard,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelFileListProps {
  serverId: string;
}

export default function ChannelFileList({ serverId }: ChannelFileListProps) {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [type, setType] = useState<AttachmentType>(AttachmentType.IMAGE);
  const [fileList, setFileList] = useState<ServerMessageFileListProps[]>([]);
  const fetchFileList = useCallback(async () => {
    if (isLastPage) return;
    const apiResponse = await fetch("/api/servers/conversation/file-list", {
      method: "POST",
      headers: getApiHeaders(fingerprintHash, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ type, serverId, page }),
      cache: "no-cache",
      signal: AbortSignal.timeout(10000),
    });
    const response = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Error fetching file list:", response.message);
      return;
    }
    if (response.statusCode === 200 && response.message === "Fetched uploads successfully") {
      setFileList((prev) => [...prev, ...response.data.items]);
      setIsLastPage(response.data.metadata.is_last_page);
    }
  }, [serverId, type, isLastPage, page]);

  useEffect(() => {
    if (open) {
      fetchFileList();
    }
  }, [open, fetchFileList]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const handleScroll = () => {
    const element = listRef.current;
    if (!element || loadingMore || isLastPage) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (page === 0) return;
    setLoadingMore(false);
    const element = listRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
  }, [fileList, page]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="p-2 hover:bg-accent rounded-md"
      >
        <FontAwesomeIcon icon={faFolderOpen} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>File List: Page {page}</SheetTitle>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => {
                if (!v) return;
                setType(v as AttachmentType);
                setPage(0);
                setFileList([]);
                setIsLastPage(false);
              }}
              className="gap-2"
            >
              <ToggleGroupItem value={AttachmentType.IMAGE} aria-label="Images">
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Images
              </ToggleGroupItem>

              <ToggleGroupItem value={AttachmentType.VIDEO} aria-label="Videos">
                <FontAwesomeIcon icon={faClapperboard} className="mr-2" />
                Videos
              </ToggleGroupItem>

              <ToggleGroupItem value={AttachmentType.AUDIO} aria-label="Audio">
                <FontAwesomeIcon icon={faFileAudio} className="mr-2" />
                Audio
              </ToggleGroupItem>

              <ToggleGroupItem value={AttachmentType.FILE} aria-label="Files">
                <FontAwesomeIcon icon={faFile} className="mr-2" />
                Files
              </ToggleGroupItem>
            </ToggleGroup>
            <SheetDescription>
              List of files shared in this direct message.
            </SheetDescription>
          </SheetHeader>
          {fileList.length > 0 ? (
            <ScrollArea
              ref={listRef}
              onScrollViewport={handleScroll}
              className="flex-1 bg-background h-full"
            >
              <div className="space-y-4 p-4">
                {fileList.map((file) => (
                  <div
                    key={file._id}
                    className="p-4 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {file.type === "image" && (
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-primary"
                            />
                          </div>
                        )}
                        {file.type === "video" && (
                          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faClapperboard}
                              className="text-destructive"
                            />
                          </div>
                        )}
                        {file.type === "audio" && (
                          <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faFileAudio}
                              className="text-success"
                            />
                          </div>
                        )}
                        {file.type === "file" && (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faFile}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={file.ipfsHash}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-card-foreground hover:underline block truncate"
                        >
                          {file.name}
                        </a>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Type: {file.mimeType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {(file.size / 1024).toFixed(2)} KB
                          </p>
                          {(file.type === "image" || file.type === "video") &&
                            file.width &&
                            file.height && (
                              <p className="text-xs text-muted-foreground">
                                Dimensions: {file.width} × {file.height}
                              </p>
                            )}
                          <p className="text-xs text-muted-foreground">
                            Uploaded:{" "}
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          ) : (
            <h1>No document found</h1>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
