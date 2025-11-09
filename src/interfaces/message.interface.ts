export interface FileUploadProps {
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

export interface NewMessageProps {
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}
