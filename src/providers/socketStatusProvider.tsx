"use client";

import { useEffect, useRef } from "react";
import { getStatusSocketIO } from "@/lib/socketioStatusSingleton";
import {
  IdentityConfirmed,
  WsErrorPayload,
  UserStatusChanged,
} from "@/interfaces/websocketStatus.interface";

interface SocketStatusProviderProps {
  userId: string;
  fingerprintHash: string;
  children: React.ReactNode;
}

export default function SocketStatusProvider({
  userId,
  fingerprintHash,
  children,
}: SocketStatusProviderProps) {
  const socket = useRef(getStatusSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId && fingerprintHash) {
        socket.emit("identity", { userDehiveId: userId, fingerprintHash });
      }
    };

    const onConnect = () => {
      console.log("[ws status connect]");
      identify();
    };

    const onManagerReconnect = (attempt: number) => {
      console.log("[ws status reconnect]", attempt);
      identify();
    };

    const onManagerReconnectAttempt = (attempt: number) => {
      console.log("[ws status reconnect_attempt]", attempt);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[ws status reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[ws status reconnect_failed]");
    };

    const onConnectError = (error: Error) => {
      console.warn("[ws status connect_error]", error);
    };

    const onError = (error: string | WsErrorPayload) => {
      console.warn("[ws status error]", error);
    };

    const onDisconnect = (reason: string) => {
      console.log("[ws status disconnect]", reason);
    };

    const onIdentityConfirmed = (p: string | IdentityConfirmed) => {
      console.log("[ws status identityConfirmed]", p);
    };

    const onUserStatusChanged = (p: string | UserStatusChanged) => {
      console.log("[ws status userStatusChanged]", p);
    };

    const onIdentityConfirmedWrapper = (raw: unknown) =>
      onIdentityConfirmed(raw as string | IdentityConfirmed);

    const onUserStatusChangedWrapper = (raw: unknown) =>
      onUserStatusChanged(raw as string | UserStatusChanged);

    socket.on("connect", onConnect);

    socket.on("connect_error", onConnectError);
    socket.on("error", onError);
    socket.on("disconnect", onDisconnect);

    socket.io.on("reconnect", onManagerReconnect);
    socket.io.on("reconnect_attempt", onManagerReconnectAttempt);
    socket.io.on("reconnect_error", onManagerReconnectError);
    socket.io.on("reconnect_failed", onManagerReconnectFailed);

    socket.on("identityConfirmed", onIdentityConfirmedWrapper);
    socket.on("userStatusChanged", onUserStatusChangedWrapper);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);

      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
      socket.off("disconnect", onDisconnect);

      socket.io.off("reconnect", onManagerReconnect);
      socket.io.off("reconnect_attempt", onManagerReconnectAttempt);
      socket.io.off("reconnect_error", onManagerReconnectError);
      socket.io.off("reconnect_failed", onManagerReconnectFailed);

      socket.off("identityConfirmed", onIdentityConfirmedWrapper);
      socket.off("userStatusChanged", onUserStatusChangedWrapper);
    };
  }, [socket, userId, fingerprintHash]);

  useEffect(() => {
    if (userId && fingerprintHash && socket.connected) {
      console.log(
        "[ws status re-identify due to userId/fingerprint change]",
        userId
      );
      socket.emit("identity", { userDehiveId: userId, fingerprintHash });
    }
  }, [userId, fingerprintHash, socket]);

  return <>{children}</>;
}
