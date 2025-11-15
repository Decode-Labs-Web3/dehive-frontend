import { Socket } from "socket.io-client";
import type {
  ServerToClientServerEvents,
  ClientToServerServerEvents,
} from "@/interfaces/websocketServerEvents.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getServerEventsSocketIO(): Socket<
  ServerToClientServerEvents,
  ClientToServerServerEvents
> {
  return getSocket(SocketType.ServerEvents) as Socket<
    ServerToClientServerEvents,
    ClientToServerServerEvents
  >;
}
