import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setFingerprintHash } from "@/store/slices/fingerprintSlice";
import { useCallback } from "react";

interface UseFingerprintResult {
  fingerprintHash: string;
  updateFingerprint: (fingerprint: string) => void;
}

export const useFingerprint = (): UseFingerprintResult => {
  const dispatch = useAppDispatch();
  const fingerprintHash = useAppSelector(
    (state) => state.fingerprint.fingerprintHash
  );

  const updateFingerprint = useCallback(
    (fingerprint: string) => {
      dispatch(setFingerprintHash(fingerprint));
    },
    [dispatch]
  );

  return {
    fingerprintHash,
    updateFingerprint,
  };
};
