import { io, Socket } from "socket.io-client"

const URL = process.env.NEXT_PUBLIC_CHANNEL_SIO_URL!;
let _socket: Socket = null

export function getSocketIO(){
  if(_socket) return _socket;
  _socket = io(URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _socket
}
