import { createContext, useContext } from "react";

interface SoundContextProps {
  sound: boolean;
  setSound: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SoundContext = createContext<SoundContextProps>({
  sound: false,
  setSound: () => {},
});

export const useSoundContext = () => useContext(SoundContext);
