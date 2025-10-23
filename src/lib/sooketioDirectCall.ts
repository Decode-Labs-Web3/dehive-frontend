import { io, Socket } from "socket.io-client";
import type {
  ServerToClientDirectCall,
  ClientToServerDirectCall,
} from "../interfaces/websocketDirectCall.interfaces";

const URL = process.env.NEXT_PUBLIC_DIRECT_CALL_SIO_URL!;
let _directCallSocket: Socket<
  ServerToClientDirectCall,
  ClientToServerDirectCall
> | null = null;

export function getDirectCallSocketIO(): Socket<
  ServerToClientDirectCall,
  ClientToServerDirectCall
> {
  if (_directCallSocket) return _directCallSocket;

  _directCallSocket = io(`${URL}/rtc`, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });

  return _directCallSocket;
}
