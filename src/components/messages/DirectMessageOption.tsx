"use client";

import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileUploadProps } from "@/interfaces/message.interface";
import {
  useCallback,
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
} from "react";
import {
  faUpload,
  faCamera,
  faPlus,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CameraCaptureDialog } from "@/components/common/CameraCaptureDialog";

interface DirectMessageOptionProps {
  channelId: string;
  setListUploadFile: React.Dispatch<React.SetStateAction<FileUploadProps[]>>;
}

export default function DirectMessageOption({
  channelId,
  setListUploadFile,
}: DirectMessageOptionProps) {
  const [open, setOpen] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", channelId);

        const apiResponse = await fetch("/api/me/conversation/file-upload", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash),
          body: formData,
          cache: "no-store",
          signal: AbortSignal.timeout(30000),
        });
        const response = await apiResponse.json();
        if (!apiResponse.ok) {
          throw new Error(response.message || "Upload failed");
        }
        if (
          response.statusCode === 201 &&
          response.message === "File uploaded successfully"
        ) {
          setListUploadFile((prev) => [...prev, response.data]);
        }
      } catch (error) {
        console.error("Error during file upload:", error);
      } finally {
        setLoading(false);
      }
    },
    [channelId, setListUploadFile, fingerprintHash]
  );

  const handleUploadClick = useCallback(() => {
    if (loading) return;
    fileInputRef.current?.click();
  }, [loading]);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;
        setOpen(false);
        await uploadFile(file);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="h-11 w-11 rounded-full" aria-label="More options">
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <div className="flex flex-col items-stretch gap-2">
            <Button variant="outline" onClick={handleUploadClick}>
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              Upload file
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,application/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              onClick={() => {
                setCameraDialogOpen(true);
                setOpen(false);
              }}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faCamera} className="mr-2" />
              Take a photo
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <CameraCaptureDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onUpload={async (file) => {
          await uploadFile(file);
        }}
        loading={loading}
      />
    </>
  );
}
