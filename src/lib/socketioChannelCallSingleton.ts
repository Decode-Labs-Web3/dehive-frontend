import { io, Socket } from "socket.io-client";
import type {
  ServerToClientChannelCall,
  ClientToServerChannelCall,
} from "../interfaces/websocketChannelCall.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getChannelCallSocketIO(): Socket<
  ServerToClientChannelCall,
  ClientToServerChannelCall
> {
  return getSocket(SocketType.ChannelCall) as Socket<
    ServerToClientChannelCall,
    ClientToServerChannelCall
  >;
}
