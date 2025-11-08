import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setFingerprintHash } from '@/store/slices/fingerprintSlice';

export const useFingerprint = () => {
  const dispatch = useAppDispatch();
  const fingerprintHash = useAppSelector(state => state.fingerprint.fingerprintHash);

  const updateFingerprint = (fingerprint: string) => {
    dispatch(setFingerprintHash(fingerprint));
  };

  return {
    fingerprintHash,
    updateFingerprint,
  };
};
