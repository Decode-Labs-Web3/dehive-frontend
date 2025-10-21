"use client";

import { createContext, useContext } from "react";

interface ServerRefreshContextProps {
  triggerRefeshServer?: () => void;
}

export const ServerRefreshContext = createContext<ServerRefreshContextProps>(
  {}
);

export const useServerRefresh = () => useContext(ServerRefreshContext);
