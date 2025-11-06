"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faFile,
  faImage,
  faClapperboard,
  faFileAudio,
} from "@fortawesome/free-solid-svg-icons";

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

interface FilePreviewProps {
  listUploadFile: FileUploadProps[];
  setListUploadFile: React.Dispatch<React.SetStateAction<FileUploadProps[]>>;
}

export default function FilePreview({
  listUploadFile,
  setListUploadFile,
}: FilePreviewProps) {
  return (
    <>
      {listUploadFile.length > 0 && (
        <div className="flex flex-row space-x-3 overflow-x-auto w-full p-4">
          {listUploadFile.map((file) => (
            <div
              key={file.uploadId}
              className="flex items-center space-x-3 p-3 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow border-border flex-shrink-0 w-64 min-w-0"
            >
              <div className="flex-shrink-0">
                {file.type === "image" && (
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-primary" />
                  </div>
                )}
                {file.type === "video" && (
                  <div className="w-6 h-6 bg-destructive/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faClapperboard}
                      className="text-destructive"
                    />
                  </div>
                )}
                {file.type === "audio" && (
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faFileAudio}
                      className="text-success"
                    />
                  </div>
                )}
                {file.type === "file" && (
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faFile}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                <p className="text-xs text-muted-foreground/70">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setListUploadFile((prev) =>
                    prev.filter((oldFile) => oldFile.uploadId !== file.uploadId)
                  );
                }}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faX} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
