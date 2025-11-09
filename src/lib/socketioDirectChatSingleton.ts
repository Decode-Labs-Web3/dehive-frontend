import { Socket } from "socket.io-client";
import type {
  ServerToClientDirectChat,
  ClientToServerDirectChat,
} from "../interfaces/websocketDirectChat.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getDirectChatSocketIO(): Socket<
  ServerToClientDirectChat,
  ClientToServerDirectChat
> {
  return getSocket(SocketType.DirectChat) as Socket<
    ServerToClientDirectChat,
    ClientToServerDirectChat
  >;
}
