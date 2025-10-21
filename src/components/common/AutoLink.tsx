import React from "react";

const LINK_REGEX = /(https?:\/\/[^\s]+)/gi;

function stripTrailingPunct(s: string) {
  return s.replace(/[.,!?;:)+\]]+$/g, "");
}

function isOnlyUrl(text: string) {
  const trimmedText = text.trim();
  const match = trimmedText.match(LINK_REGEX);
  return !!match && match.length === 1 && stripTrailingPunct(match[0]) === text;
}

interface AutoLinkProps {
  text: string;
}

export default function AutoLink({ text }: AutoLinkProps) {
  if (!text) return null;
  const trimmed = text.trim();

  if (isOnlyUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-blue-500 underline hover:opacity-80 break-all"
      >
        {trimmed}
      </a>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const regex = /(https?:\/\/[^\s]+)/gi;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    const match = m[0];
    const start = m.index;
    const end = start + match.length;

    if (lastIndex < start) {
      parts.push(text.slice(lastIndex, start));
    }

    const raw = stripTrailingPunct(match);

    parts.push(
      <a
        key={`${raw}-${start}`}
        href={raw}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-blue-500 underline hover:opacity-80 break-all"
      >
        {raw}
      </a>
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
