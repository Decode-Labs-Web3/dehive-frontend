"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileZipper,
} from "@fortawesome/free-solid-svg-icons";

type Attachment = {
  type: "image" | "video" | "audio" | "file";
  ipfsHash: string;
  name: string;
  size: number;
  mimeType: string;
};

export default function AttachmentList({
  attachments,
}: {
  attachments?: Attachment[];
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-1 flex flex-col w-40">
      {attachments?.map((att, i) => (
        <div key={i} className="mb-2 break-inside-avoid">
          <AttachmentItem att={att} />
        </div>
      ))}
    </div>
  );
}

function AttachmentItem({ att }: { att: Attachment }) {
  const href = ipfsToGateway(att.ipfsHash);
  const mime = att.mimeType || "";
  const isImg = mime.startsWith("image/");
  const isVid = mime.startsWith("video/");
  const isAud = mime.startsWith("audio/");

  // If we cannot resolve a valid media URL, don't render the element
  if (!href) return null;

  if (isImg) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group overflow-hidden rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition"
      >
        <div className="relative w-full h-40">
          <Image
            src={href}
            alt={att.name}
            fill
            unoptimized
            className="object-contain"
          />
        </div>
        <FileMeta name={att.name} size={att.size} />
      </a>
    );
  }

  if (isVid) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group overflow-hidden rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition"
      >
        <video
          src={href}
          muted
          playsInline
          className="w-full h-40 object-contain bg-black"
        />
        <FileMeta name={att.name} size={att.size} />
      </a>
    );
  }

  if (isAud) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group overflow-hidden rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition p-3"
      >
        <div className="text-sm mb-2 truncate">{att.name}</div>
        <audio src={href} controls className="w-full" />
        <div className="mt-1 text-xs text-muted-foreground">
          {prettySize(att.size)}
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition p-3"
    >
      <FontAwesomeIcon icon={pickFileIcon(mime)} className="h-6 w-6" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{att.name}</div>
        <div className="text-xs text-muted-foreground">
          {mime || "file"} · {prettySize(att.size)}
        </div>
      </div>
    </a>
  );
}

function ipfsToGateway(ipfsUrl: string): string {
  if (!ipfsUrl) return "";
  if (ipfsUrl.startsWith("http://") || ipfsUrl.startsWith("https://"))
    return ipfsUrl;
  const cid = ipfsUrl.replace("ipfs://", "").replace(/^\/+/, "");
  if (!cid) return "";
  return `http://35.247.142.76:8080/ipfs/${cid}`;
}

function prettySize(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes,
    i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function pickFileIcon(mime: string) {
  if (mime.includes("pdf")) return faFilePdf;
  if (mime.includes("word") || mime.includes("msword")) return faFileWord;
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return faFileExcel;
  if (mime.includes("powerpoint") || mime.includes("presentation"))
    return faFilePowerpoint;
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("7z"))
    return faFileZipper;
  return faFile;
}

function FileMeta({ name, size }: { name: string; size: number }) {
  return (
    <div className="px-3 py-2 border-t border-border">
      <div className="truncate text-sm">{name}</div>
      <div className="text-xs text-muted-foreground">{prettySize(size)}</div>
    </div>
  );
}
