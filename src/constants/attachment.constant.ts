export const ATTACHMENT_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  FILE: "file",
} as const;

export type AttachmentType =
  (typeof ATTACHMENT_TYPE)[keyof typeof ATTACHMENT_TYPE];
