"use client";

import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { useCallback, useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faCamera,
  faPlus,
  faRepeat,
  faCheck,
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

export default function MessageOption() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const webcamRef = useRef<Webcam | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasCamError, setHasCamError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleUserMedia = useCallback(() => {
    setHasCamError(null);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (dialogOpen) setImgSrc(null);
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

  const handleUsePhoto = () => {
    if (!imgSrc) return;
    const file = dataURLtoFile(imgSrc, `snapshot_${Date.now()}.jpg`);
    setDialogOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setOpen(false);
  };

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
              accept="image/*"
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
              Chụp ảnh bằng camera của thiết bị. Hãy cấp quyền truy cập camera
              khi được hỏi.
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
                  className="w-full h-[360px] object-cover"
                />
              </div>
            ) : (
              <div className="w-full rounded-xl overflow-hidden bg-black/70">
                <Image
                  src={imgSrc}
                  alt="Captured"
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
                  <Button variant="secondary" onClick={() => setImgSrc(null)}>
                    <FontAwesomeIcon icon={faRepeat} className="mr-2" />
                    Retake
                  </Button>
                  <Button onClick={handleUsePhoto}>
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Use photo
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
