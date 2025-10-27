"use client";

import { useContext, createContext } from "react";
import { CallProps } from "@/interfaces/call.interface";

interface MeCallContextProps {
  meCallState: CallProps;
  setMeCallState: React.Dispatch<React.SetStateAction<CallProps>>;
}

const initialMeCall: CallProps = {
  conversation_id: null,
  status: "idle",
  user_info: null,
};

export const DirectCallContext = createContext<MeCallContextProps>({
  meCallState: initialMeCall,
  setMeCallState: () => {},
});

export const useDirectCallContext = () => useContext(DirectCallContext);
