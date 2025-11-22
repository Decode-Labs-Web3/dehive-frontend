import fingerprintReducer, { setFingerprintHash } from '../fingerprintSlice';

describe('fingerprintSlice', () => {
  const initialState = {
    fingerprintHash: '',
  };

  it('should handle initial state', () => {
    expect(fingerprintReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setFingerprintHash', () => {
    const hash = 'test-hash-123';
    const actual = fingerprintReducer(initialState, setFingerprintHash(hash));
    expect(actual.fingerprintHash).toEqual(hash);
  });
});
