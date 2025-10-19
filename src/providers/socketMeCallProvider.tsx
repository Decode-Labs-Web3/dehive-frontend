"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import { MeCallStateContext } from "@/contexts/MeCallContext.contexts";
import type {
  ClientToServerCallEvents,
  ServerToClientCallEvents,
  WsErrorPayload,
  IdentityConfirmed,
  IncomingCallPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  CallStartedPayload,
  CallTimeoutPayload,
} from "@/interfaces/websocketMeCall.interfaces";

interface SocketMeCallProviderProps {
  userId: string;
  children: React.ReactNode;
}

interface CallProps {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended" | "timeout";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  error: string | null;
}

export default function SocketMeCallProvider({
  userId,
  children,
}: SocketMeCallProviderProps) {
  const router = useRouter();
  const socket = useRef<
    Socket<ServerToClientCallEvents, ClientToServerCallEvents>
  >(getMeCallSocketIO()).current;
  const pathname = usePathname();
  const latestPathRef = useRef(pathname);

  const [globalCallState, setGlobalCallState] = useState<CallProps>({
    callId: null,
    status: "idle",
    isIncoming: false,
    isOutgoing: false,
    callerId: null,
    calleeId: null,
    error: null,
  });

  useEffect(() => {
    const identify = () => {
      if (!userId) return;
      socket.emit("identity", userId);
    };

    const onConnect = () => {
      console.log("[mecall connect]");
      identify();
    };
    const onConnectError = (e: Error) =>
      console.warn("[mecall connect_error]", e);
    const onDisconnect = (reason: string) =>
      console.log("[mecall disconnect]", reason);

    const onError = (e: WsErrorPayload) => {
      console.warn("[mecall error]", e);
      setGlobalCallState((prev) => ({
        ...prev,
        error: e.message || "WebSocket error occurred",
      }));
    };

    const onIdentityConfirmed = (p: IdentityConfirmed) => {
      console.log("[mecall identityConfirmed]", p);
    };

    const onIncoming = (p: IncomingCallPayload) => {
      console.log("[incomingCall]", p);
      console.log("this is incomming phone from socket provider");

      setGlobalCallState({
        callId: p.call_id,
        status: "ringing",
        isIncoming: true,
        isOutgoing: false,
        callerId: p.caller_id,
        calleeId: null,
        error: null,
      });

      if (p.caller_id) {
        const targetPath = `/app/channels/me/${p.caller_id}/call`;
        if (pathname !== targetPath) {
          console.log(
            "Auto-navigating to call page for incoming call from:",
            p.caller_id
          );
          router.push(targetPath);
        } else {
          console.log("Already on call page, no navigation needed");
        }
      }
    };

    const onStarted = (p: CallStartedPayload) => {
      console.log("[callStarted]", p);

      setGlobalCallState((prev) => ({
        ...prev,
        callId: p.call_id,
        status: "ringing",
        isOutgoing: true,
        isIncoming: false,
        calleeId: p.target_user_id,
      }));

      if (p.target_user_id) {
        const targetPath = `/app/channels/me/${p.target_user_id}/call`;
        if (pathname !== targetPath) {
          console.log(
            "Auto-navigating to call page for outgoing call to:",
            p.target_user_id
          );
          router.push(targetPath);
        } else {
          console.log("Already on call page, no navigation needed");
        }
      }
    };

    const onAccepted = (p: CallAcceptedPayload) => {
      console.log("[callAccepted]", p);
      setGlobalCallState((prev) => ({
        ...prev,
        status: "connected",
        isIncoming: false,
        isOutgoing: false,
        calleeId: p.callee_id || prev.calleeId,
      }));
    };

    const onDeclined = (p: CallDeclinedPayload) => {
      console.log("[callDeclined]", p);
      setGlobalCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        callerId: null,
        calleeId: null,
        error: null,
      });
    };

    const onEnded = (p: CallEndedPayload) => {
      console.log("[callEnded]", p);
      setGlobalCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        callerId: null,
        calleeId: null,
        error: null,
      });
    };

    const onPong = (data: { timestamp: string; message: "pong" }) =>
      console.log("[pong]", data);

    const onTimeout = (p: CallTimeoutPayload) => {
      console.log("[callTimeout]", p);
      setGlobalCallState({
        callId: null,
        status: "timeout",
        isIncoming: false,
        isOutgoing: false,
        callerId: null,
        calleeId: null,
        error: "Call timed out",
      });
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);

    socket.on("error", onError);
    socket.on("identityConfirmed", onIdentityConfirmed);

    socket.on("incomingCall", onIncoming);
    socket.on("callStarted", onStarted);
    socket.on("callAccepted", onAccepted);
    socket.on("callDeclined", onDeclined);
    socket.on("callEnded", onEnded);
    socket.on("callTimeout", onTimeout);

    socket.on("pong", onPong);

    socket.connect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);

      socket.off("error", onError);
      socket.off("identityConfirmed", onIdentityConfirmed);

      socket.off("incomingCall", onIncoming);
      socket.off("callStarted", onStarted);
      socket.off("callAccepted", onAccepted);
      socket.off("callDeclined", onDeclined);
      socket.off("callEnded", onEnded);
      socket.off("callTimeout", onTimeout);

      socket.off("pong", onPong);
    };
  }, [socket, userId, router, pathname]);

  useEffect(() => {
    if (!socket.connected) return;
    if (userId) socket.emit("identity", userId);
  }, [userId, socket]);

  useEffect(() => {
    latestPathRef.current = pathname;
  }, [pathname]);

  return (
    <MeCallStateContext.Provider
      value={{ globalCallState, setGlobalCallState }}
    >
      {children}
    </MeCallStateContext.Provider>
  );
}
