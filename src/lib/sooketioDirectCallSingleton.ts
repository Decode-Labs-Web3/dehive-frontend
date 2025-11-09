import { Socket } from "socket.io-client";
import type {
  ServerToClientDirectCall,
  ClientToServerDirectCall,
} from "../interfaces/websocketDirectCall.interface";
import { getSocket, SocketType } from "./socketFactory";

export function getDirectCallSocketIO(): Socket<
  ServerToClientDirectCall,
  ClientToServerDirectCall
> {
  return getSocket(SocketType.DirectCall) as Socket<
    ServerToClientDirectCall,
    ClientToServerDirectCall
  >;
}
