import { io, Socket } from "socket.io-client";
import type {
  ServerToClientCallEvents,
  ClientToServerCallEvents,
} from "../interfaces/websocketMeCall.interfaces";

const URL = (process.env.NEXT_PUBLIC_ME_CALL_SIO_URL ?? "").replace(/\/+$/, "");
let _socket: Socket<ServerToClientCallEvents, ClientToServerCallEvents> | null =
  null;

export function getMeCallSocketIO() {
  if (_socket) return _socket;

  _socket = io(`${URL}/rtc`, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });

  return _socket;
}
