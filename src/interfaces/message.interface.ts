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

export interface ServerMessageFileListProps {
  _id: string;
  ownerId: string;
  serverId: string;
  type: string;
  ipfsHash: string;
  name: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface DirectMessageFileListProps {
  _id: string;
  ownerId: string;
  conversationId: string;
  type: string;
  url: string;
  ipfsHash: string;
  name: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

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
