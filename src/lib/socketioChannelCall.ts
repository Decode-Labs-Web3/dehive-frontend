import { io, Socket } from "socket.io-client";
import type {
  ServerToClientChannelCall,
  ClientToServerChannelCall,
} from "../interfaces/websocketChannelCall.interfaces";

const URL = process.env.NEXT_PUBLIC_CHANNEL_CALL_SIO_URL!;
let _channelCallSocket: Socket<
  ServerToClientChannelCall,
  ClientToServerChannelCall
> | null = null;

export function getChannelCallSocketIO(): Socket<
  ServerToClientChannelCall,
  ClientToServerChannelCall
> {
  if (_channelCallSocket) return _channelCallSocket;

  _channelCallSocket = io(`${URL}/channel-rtc`, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });

  return _channelCallSocket;
}
