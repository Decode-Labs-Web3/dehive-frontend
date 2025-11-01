import { io, Socket } from "socket.io-client";
import type {
  ServerToClientStatus,
  ClientToServerStatus,
} from "@/interfaces/websocketStatus";

const URL = process.env.NEXT_PUBLIC_STATUS_ONLINE_SIO_URL!;
let _statusSocket: Socket<ServerToClientStatus, ClientToServerStatus> | null =
  null;

export function getStatusSocketIO(): Socket<
  ServerToClientStatus,
  ClientToServerStatus
> {
  if (_statusSocket) return _statusSocket;
  _statusSocket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _statusSocket;
}
