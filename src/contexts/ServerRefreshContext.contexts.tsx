"use client"

import { createContext, useContext } from "react"

interface ServerContextValue {
  refreshServers?: () => void;
}

export const ServerContext = createContext<ServerContextValue>({})

export const useServerContext = () => useContext(ServerContext);
