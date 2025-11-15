import { io, Socket } from "socket.io-client";

export enum SocketType {
  Status = "status",
  DirectCall = "directCall",
  DirectChat = "directChat",
  ChannelChat = "channelChat",
  ChannelCall = "channelCall",
  ServerEvents = "serverEvents",
}

const socketConfigs: Record<SocketType, { url: string }> = {
  [SocketType.ChannelCall]: {
    url: process.env.NEXT_PUBLIC_CHANNEL_CALL_SIO_URL!,
  },
  [SocketType.ChannelChat]: {
    url: process.env.NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL!,
  },
  [SocketType.DirectChat]: {
    url: process.env.NEXT_PUBLIC_DIRECT_CHAT_SIO_URL!,
  },
  [SocketType.Status]: { url: process.env.NEXT_PUBLIC_STATUS_ONLINE_SIO_URL! },
  [SocketType.DirectCall]: {
    url: process.env.NEXT_PUBLIC_DIRECT_CALL_SIO_URL!,
  },
  [SocketType.ServerEvents]: {
    url: process.env.NEXT_PUBLIC_DEHIVE_SERVER!,
  },
};

const socketRegistry = new Map<SocketType, Socket>();

export function getSocket(type: SocketType): Socket {
  if (socketRegistry.has(type)) {
    return socketRegistry.get(type)!;
  }

  const config = socketConfigs[type];
  if (!config) {
    throw new Error(`Unknown socket type: ${type}`);
  }

  const socket = io(config.url, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
  });

  socketRegistry.set(type, socket);
  return socket;
}
