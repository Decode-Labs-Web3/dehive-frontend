import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setMicrophone, setSpeaker } from "@/store/slices/audioSetting";
import { useCallback } from "react";

interface UseAudioSettingProps {
  audioSetting: {
    microphone: boolean;
    speaker: boolean;
  };
  updateMicrophone: (status: boolean) => void;
  updateSpeaker: (status: boolean) => void;
}

export const useAudioSetting = (): UseAudioSettingProps => {
  const dispatch = useAppDispatch();
  const audioSetting = useAppSelector((state) => state.audioSetting);

  const updateMicrophone = useCallback(
    (status: boolean) => {
      dispatch(setMicrophone(status));
    },
    [dispatch]
  );

  const updateSpeaker = useCallback(
    (status: boolean) => {
      dispatch(setSpeaker(status));
    },
    [dispatch]
  );

  return {
    audioSetting,
    updateMicrophone,
    updateSpeaker,
  };
};
