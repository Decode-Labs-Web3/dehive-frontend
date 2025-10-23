import { io, Socket } from "socket.io-client";
import type {
  ServerToClientChannelChat,
  ClientToServerChannelChat,
} from "@/interfaces/websocketChannelChat.interfaces";

const URL = process.env.NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL!;
let _channelChatSocket: Socket<
  ServerToClientChannelChat,
  ClientToServerChannelChat
> | null = null;

export function getChannelChatSocketIO(): Socket<
  ServerToClientChannelChat,
  ClientToServerChannelChat
> {
  if (_channelChatSocket) return _channelChatSocket;
  _channelChatSocket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _channelChatSocket;
}
