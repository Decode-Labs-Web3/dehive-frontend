"use client";

import { useRef } from "react";

export default function TingToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // setInterval(async () => {
  //   const a = audioRef.current;
  //   if (!a) return;
  //   a.pause();
  //   a.currentTime = 0;
  //   await a.play();
  // }, 3000);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border px-3 py-2">
      <audio ref={audioRef} src="/sounds/ting.wav" preload="auto" />
    </div>
  );
}
