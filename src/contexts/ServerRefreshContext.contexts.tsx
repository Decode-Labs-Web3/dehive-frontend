"use client";

import { createContext, useContext } from "react";

interface ServerRefreshContextProps {
  refreshServers?: () => void;
}

export const ServerRefreshContext = createContext<ServerRefreshContextProps>(
  {}
);

export const useServerRefresh = () => useContext(ServerRefreshContext);
