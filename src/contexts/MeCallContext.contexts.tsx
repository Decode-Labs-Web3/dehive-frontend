"use client";

import { createContext, useContext } from "react";

interface MeCallProps {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended" | "timeout";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  error: string | null;
}

interface MeCallStateProps {
  globalCallState: MeCallProps;
  setGlobalCallState: React.Dispatch<React.SetStateAction<MeCallProps>>;
}

const defaultCallState: MeCallProps = {
  callId: null,
  status: "idle",
  isIncoming: false,
  isOutgoing: false,
  callerId: null,
  calleeId: null,
  error: null,
};

const defaultContext: MeCallStateProps = {
  globalCallState: defaultCallState,
  setGlobalCallState: () => {},
};

export const MeCallStateContext =
  createContext<MeCallStateProps>(defaultContext);

export const useMeCallState = () => useContext(MeCallStateContext);
