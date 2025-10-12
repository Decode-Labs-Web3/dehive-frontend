import { io, Socket } from "socket.io-client";
import type {
  ServerToClientChannelEvents,
  ClientToServerChannelEvents,
} from "@/interfaces/websocketChannel.interfaces";

const URL = process.env.NEXT_PUBLIC_CHANNEL_SIO_URL!;
let _channelSocket: Socket<
  ServerToClientChannelEvents,
  ClientToServerChannelEvents
> | null = null;

export function getChannelSocketIO(): Socket<
  ServerToClientChannelEvents,
  ClientToServerChannelEvents
> {
  if (_channelSocket) return _channelSocket;
  _channelSocket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _channelSocket;
}
