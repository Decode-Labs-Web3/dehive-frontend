"use client";

import { createContext, useContext } from "react";

interface ConversationRefreshContextProps {
  triggerRefreshConversation?: () => void;
}

export const ConversationRefreshContext =
  createContext<ConversationRefreshContextProps>({});

export const useConversationRefresh = () =>
  useContext(ConversationRefreshContext);
