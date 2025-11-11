"use client";
/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import { useEffect, useState } from "react";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

interface LinkPreviewProps {
  content: string;
  className?: string;
}

export default function LinkPreview({ content, className }: LinkPreviewProps) {
  // Hooks must always be called unconditionally
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive URL (may be null)
  const match = /https?:\/\/[^\s<>()]+/g.exec(content);
  const url = match ? match[0].replace(/[\.,!?;:)\]\}]+$/g, "") : null;
  const validUrl = url && !url.startsWith("data:") ? url : null;

  useEffect(() => {
    if (!validUrl) return;
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(validUrl!)}`,
          {
            headers: { "X-Frontend-Internal-Request": "true" },
          }
        );
        const json = await res.json();
        if (!active) return;
        if (!res.ok || json.error) {
          setError(json.error || "preview_failed");
        } else {
          setData(json as LinkPreviewData);
        }
      } catch (e: any) {
        if (active) setError(e?.message || "error");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [validUrl]);

  if (!validUrl) return null;

  if (loading) {
    return (
      <div
        className={clsx(
          "rounded-md border border-border bg-card p-3 text-xs text-muted-foreground animate-pulse",
          className
        )}
      >
        Fetching preview...
      </div>
    );
  }
  if (error || !data) {
    return (
      <div
        className={clsx(
          "rounded-md border border-border bg-card p-3 text-xs text-muted-foreground",
          className
        )}
      >
        Preview not available
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "group overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      {data.image && (
        <div className="relative w-full bg-muted">
          <img
            src={data.image}
            alt={data.title || data.siteName}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 p-3">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {data.siteName}
        </span>
        {data.title && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="line-clamp-2 font-medium text-foreground hover:underline"
          >
            {data.title}
          </a>
        )}
        {data.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
}
