import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { Socket as IOSocket } from "socket.io-client";
import { getStatusSocketIO } from "@/lib/socketioStatus";
import type {
  UserStatusChanged,
  IdentityConfirmed,
  ServerToClientStatus,
  ClientToServerStatus,
} from "@/interfaces/websocketStatus";

type UserStatusListener = (payload: UserStatusChanged) => void;

type SocketStatusContextValue = {
  socket: IOSocket<ServerToClientStatus, ClientToServerStatus> | null;
  connected: boolean;
  identified: boolean;
  connect: () => void;
  disconnect: () => void;
  identify: (payload: {
    userDehiveId: string;
    fingerprintHash: string;
  }) => void;
  addUserStatusListener: (cb: UserStatusListener) => () => void;
};

const SocketStatusContext = createContext<SocketStatusContextValue | undefined>(
  undefined
);

export const SocketStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<IOSocket<
    ServerToClientStatus,
    ClientToServerStatus
  > | null>(null);
  const listenersRef = useRef<Set<UserStatusListener>>(new Set());
  const [connected, setConnected] = useState(false);
  const [identified, setIdentified] = useState(false);

  useEffect(() => {
    socketRef.current = getStatusSocketIO();

    const s = socketRef.current;
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setIdentified(false);
    };

    const safeParse = (data: unknown) => {
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
      return data;
    };

    const onIdentityConfirmed = (raw: IdentityConfirmed | string) => {
      const parsed = safeParse(raw) as IdentityConfirmed | null;
      if (parsed && parsed.userDehiveId) {
        setIdentified(true);
      }
    };

    const onError = (raw: unknown) => {
      const parsed = safeParse(raw) as { message?: string } | null;
      console.warn("Status socket error:", parsed ?? raw);
    };

    const onUserStatusChanged = (raw: UserStatusChanged | string) => {
      const parsed = safeParse(raw) as UserStatusChanged | null;
      if (!parsed) return;
      for (const cb of listenersRef.current) {
        try {
          cb(parsed);
        } catch (err) {
          console.error("UserStatus listener failed:", err);
        }
      }
    };

    const onIdentityConfirmedWrapper = (raw: unknown) =>
      onIdentityConfirmed(raw as IdentityConfirmed | string);
    const onErrorWrapper = (raw: unknown) => onError(raw);
    const onUserStatusChangedWrapper = (raw: unknown) =>
      onUserStatusChanged(raw as UserStatusChanged | string);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("identityConfirmed", onIdentityConfirmedWrapper);
    s.on("error", onErrorWrapper);
    s.on("userStatusChanged", onUserStatusChangedWrapper);

    if (!s.connected) s.connect();

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("identityConfirmed", onIdentityConfirmedWrapper);
      s.off("error", onErrorWrapper);
      s.off("userStatusChanged", onUserStatusChangedWrapper);
    };
  }, []);

  const connect = useCallback(() => {
    const s = socketRef.current ?? getStatusSocketIO();
    if (!s) return;
    if (!s.connected) s.connect();
  }, []);

  const disconnect = useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    if (s.connected) s.disconnect();
  }, []);

  const identify = useCallback(
    (payload: { userDehiveId: string; fingerprintHash: string }) => {
      const s = socketRef.current;
      if (!s) return;
      s.emit("identity", payload);
    },
    []
  );

  const addUserStatusListener = useCallback((cb: UserStatusListener) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const value: SocketStatusContextValue = {
    socket: socketRef.current,
    connected,
    identified,
    connect,
    disconnect,
    identify,
    addUserStatusListener,
  };

  return (
    <SocketStatusContext.Provider value={value}>
      {children}
    </SocketStatusContext.Provider>
  );
};

export function useSocketStatus(): SocketStatusContextValue {
  const ctx = useContext(SocketStatusContext);
  if (!ctx) {
    throw new Error(
      "useSocketStatus must be used within a SocketStatusProvider"
    );
  }
  return ctx;
}

export default SocketStatusProvider;
