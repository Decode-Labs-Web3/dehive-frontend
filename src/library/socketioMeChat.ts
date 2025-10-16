import { io, Socket } from "socket.io-client";
import type {
  ServerToClientMeEvents,
  ClientToServerMeEvents,
} from "../interfaces/websocketMeChat.interfaces";

const URL = process.env.NEXT_PUBLIC_ME_CHAT_SIO_URL!;
let _socket: Socket<ServerToClientMeEvents, ClientToServerMeEvents> | null =
  null;

export function getMeChatSocketIO(): Socket<
  ServerToClientMeEvents,
  ClientToServerMeEvents
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
