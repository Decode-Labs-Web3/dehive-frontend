import { Socket } from "socket.io-client";
import type {
  ServerToClientStatus,
  ClientToServerStatus,
} from "@/interfaces/websocketStatus.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getStatusSocketIO(): Socket<
  ServerToClientStatus,
  ClientToServerStatus
> {
  return getSocket(SocketType.Status) as Socket<
    ServerToClientStatus,
    ClientToServerStatus
  >;
}
