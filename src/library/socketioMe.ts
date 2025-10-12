import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../interfaces/index.interfaces";

const URL = process.env.NEXT_PUBLIC_ME_SIO_URL!;
let _socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocketIO(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (_socket) return _socket;
  _socket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _socket;
}
