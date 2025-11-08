import {  createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FingerprintState {
  fingerprintHash: string;
}

const initialState: FingerprintState = {
  fingerprintHash: '',
};

const fingerprintSlice = createSlice({
  name: 'fingerprint',
  initialState,
  reducers: {
    setFingerprintHash(state, action: PayloadAction<string>) {
      state.fingerprintHash = action.payload;
    },
  },
});

export const { setFingerprintHash } = fingerprintSlice.actions;

export default fingerprintSlice.reducer;
