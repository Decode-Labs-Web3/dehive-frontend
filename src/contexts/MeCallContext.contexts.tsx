"use client";

import { createContext, useContext } from "react";
import { CallProps } from "@/interfaces/call.interfaces";

interface MeCallStateProps {
  globalCallState: CallProps;
  setGlobalCallState: React.Dispatch<React.SetStateAction<CallProps>>;
}

const defaultCallState: CallProps = {
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
