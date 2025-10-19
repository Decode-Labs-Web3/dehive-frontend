"use client";

import { useContext, createContext } from "react";
import { CallProps } from "@/interfaces/call.interfaces";

interface MeCallContextProps {
  meCallState: CallProps;
  setMeCallState: React.Dispatch<React.SetStateAction<CallProps>>;
}

const initialMeCall: CallProps = {
  callId: null,
  status: "idle",
  isIncoming: false,
  isOutgoing: false,
  caller_info: null,
  callee_info: null,
  isTimeout: false,
};

export const MeCallContext = createContext<MeCallContextProps>({
  meCallState: initialMeCall,
  setMeCallState: () => {},
});

export const useMeCallContext = () => useContext(MeCallContext);
