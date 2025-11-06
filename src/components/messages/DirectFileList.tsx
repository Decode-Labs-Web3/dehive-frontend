"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export enum AttachmentType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FILE = "file",
}

interface DirectFileListProps {
  channelId: string;
}

export default function DirectFileList({ channelId }: DirectFileListProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AttachmentType>(AttachmentType.IMAGE);
  const fetchFileList = useCallback(async () => {
    const apiResponse = await fetch("/api/me/conversation/file-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frontend-Internal-Request": "true",
      },
      body: JSON.stringify({ type, channelId }),
      cache: "no-cache",
      signal: AbortSignal.timeout(10000),
    });
    if (!apiResponse.ok) {
      const data = await apiResponse.json();
      console.log("Fetched file list:", data);
      // Handle the fetched file list data as needed
    } else {
      console.error("Failed to fetch file list");
    }
  }, [channelId, type]);

  useEffect(() => {
    if (open) {
      fetchFileList();
    }
  }, [open, fetchFileList]);

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
            <SheetTitle>File List</SheetTitle>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => v && setType(v as AttachmentType)}
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
          {/* File list content goes here */}
        </SheetContent>
      </Sheet>
    </>
  );
}
