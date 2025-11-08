import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import fingerprintReducer from './slices/fingerprintSlice';

export const store = configureStore({
  reducer: {
    fingerprint: fingerprintReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
