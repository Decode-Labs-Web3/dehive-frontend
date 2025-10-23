import { io, Socket } from "socket.io-client";
import type {
  ServerToClientDirectChat,
  ClientToServerDirectChat,
} from "../interfaces/websocketDirectChat.interfaces";

const URL = process.env.NEXT_PUBLIC_DIRECT_CHAT_SIO_URL!;
let _directChatSocket: Socket<
  ServerToClientDirectChat,
  ClientToServerDirectChat
> | null = null;

export function getDirectChatSocketIO(): Socket<
  ServerToClientDirectChat,
  ClientToServerDirectChat
> {
  if (_directChatSocket) return _directChatSocket;
  _directChatSocket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _directChatSocket;
}
