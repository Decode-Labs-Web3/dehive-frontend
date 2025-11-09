import { Socket } from "socket.io-client";
import type {
  ServerToClientChannelChat,
  ClientToServerChannelChat,
} from "@/interfaces/websocketChannelChat.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getChannelChatSocketIO(): Socket<
  ServerToClientChannelChat,
  ClientToServerChannelChat
> {
  return getSocket(SocketType.ChannelChat) as Socket<
    ServerToClientChannelChat,
    ClientToServerChannelChat
  >;
}
