"use client";

import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useCallback,
  useRef,
  useState,
  useEffect,
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
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

interface FileUploadProps {
  uploadId: string;
  type: "image" | "video" | "audio" | "file";
  ipfsHash: string;
  name: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  durationMs: number;
}

interface ChannelMessageOptionProps {
  serverId: string;
  setListUploadFile: React.Dispatch<React.SetStateAction<FileUploadProps[]>>;
}

export default function ChannelMessageOption({
  serverId,
  setListUploadFile,
}: ChannelMessageOptionProps) {
  const webcamRef = useRef<Webcam>(null);
  const [open, setOpen] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setCapturedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasCamError, setHasCamError] = useState<string | null>(null);

  const handleUserMedia = useCallback(() => {
    setHasCamError(null);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      setImgSrc(null);
      setCapturedFile(null);
    }
  }, [dialogOpen]);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) setImgSrc(imageSrc);
  }, []);

  const dataURLtoFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleUploadPhoto = async () => {
    if (!imgSrc) return;
    const file = dataURLtoFile(imgSrc, `snapshot_${Date.now()}.jpg`);
    setCapturedFile(file);
    setDialogOpen(false);
    await uploadFile(file);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("serverId", serverId);

        const apiResponse = await fetch(
          "/api/servers/conversation/file-upload",
          {
            method: "POST",
            headers: getApiHeaders(fingerprintHash),
            body: formData,
            cache: "no-store",
            signal: AbortSignal.timeout(30000),
          }
        );
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
    [ serverId, setListUploadFile]
  );

  const handleUploadClick = useCallback(() => {
    if (loading) return;
    fileInputRef.current?.click();
  }, [loading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setDialogOpen(true);
                setOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faCamera} className="mr-2" />
              Take a photo
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Take a photo</DialogTitle>
            <DialogDescription>
              Take a photo using your device camera. Please grant camera access
              when prompted.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full flex flex-col items-center gap-3">
            {hasCamError && (
              <div className="text-sm text-red-600 w-full">{hasCamError}</div>
            )}

            {!imgSrc ? (
              <div className="w-full rounded-xl overflow-hidden bg-black/70">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  onUserMedia={handleUserMedia}
                  onUserMediaError={(err) => {
                    const msg = typeof err === "string" ? err : err?.message;
                    setHasCamError(msg || "Cannot access camera");
                  }}
                  className="w-full h-[360px] object-cover"
                />
              </div>
            ) : (
              <div className="w-full rounded-xl overflow-hidden bg-black/70">
                <Image
                  src={imgSrc}
                  alt="Captured"
                  width={640}
                  height={360}
                  unoptimized
                  className="w-full h-[360px] object-contain bg-black"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              {!imgSrc ? (
                <Button onClick={capture} disabled={!isReady}>
                  <FontAwesomeIcon icon={faCamera} className="mr-2" />
                  Capture
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setImgSrc(null);
                      setCapturedFile(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faRepeat} className="mr-2" />
                    Retake picture
                  </Button>
                  <Button onClick={handleUploadPhoto}>
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Upload this picture
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
