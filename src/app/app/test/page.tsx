"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type IdentityPayload = unknown; // thay bằng kiểu bạn mong đợi, ví dụ: { userId: string }

export default function Test() {
  const [p, setP] = useState<IdentityPayload | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SIO_URL;
    if (!url) {
      console.error("Missing NEXT_PUBLIC_SIO_URL");
      return;
    }

    // Tránh tạo 2 kết nối ở dev (Strict Mode) bằng ref
    if (socketRef.current) return;

    const s = io(url, {
      transports: ["websocket"], // chỉ WS (tuỳ backend)
      // withCredentials: true,   // bật nếu server yêu cầu cookie/CORS
      // path: "/socket.io",      // set nếu backend đổi path
    });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("connected:", s.id);
      s.emit("identity", "68dab7c935e367e9a89d0c0b");
    });

    s.on("identityConfirmed", (payload: IdentityPayload) => {
      setP(payload);
      console.log("identity OK", payload);
    });

    s.on("connect_error", (e) => console.warn("connect_error", e));
    s.on("error", (e) => console.warn("ws error", e));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  return p ? (
    <div>{typeof p === "string" ? p : JSON.stringify(p)}</div>
  ) : (
    <div>Testing socket…</div>
  );
}
