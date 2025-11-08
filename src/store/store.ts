import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import fingerprintReducer from './slices/fingerprintSlice';
import directMemberReducer from './slices/directMemberSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    fingerprint: fingerprintReducer,
    directMembers: directMemberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
