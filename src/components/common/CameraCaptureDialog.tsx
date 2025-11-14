"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faRepeat,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void> | void;
  loading?: boolean;
}

export function CameraCaptureDialog({
  open,
  onOpenChange,
  onUpload,
  loading = false,
}: CameraCaptureDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isReady, setIsReady] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasCamError, setHasCamError] = useState<string | null>(null);

  const handleUserMedia = useCallback(() => {
    setHasCamError(null);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (open) {
      // Reset state each time dialog opens
      setImgSrc(null);
      setHasCamError(null);
      setIsReady(false);
    }
  }, [open]);

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
    if (!imgSrc || loading) return;
    const file = dataURLtoFile(imgSrc, `snapshot_${Date.now()}.jpg`);
    await onUpload(file);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  const msg =
                    typeof err === "string" ? err : (err as Error)?.message;
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
              <Button onClick={capture} disabled={!isReady || loading}>
                <FontAwesomeIcon icon={faCamera} className="mr-2" />
                Capture
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setImgSrc(null)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRepeat} className="mr-2" />
                  Retake picture
                </Button>
                <Button onClick={handleUploadPhoto} disabled={loading}>
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Upload this picture
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
