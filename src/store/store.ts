import { configureStore } from '@reduxjs/toolkit';
import fingerprintReducer from './slices/fingerprintSlice';

export const store = configureStore({
  reducer: {
    fingerprint: fingerprintReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
