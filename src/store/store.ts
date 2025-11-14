import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import serverRoot from './slices/serverRootSlice';
import fingerprintReducer from './slices/fingerprintSlice';
import directMemberReducer from './slices/directMemberSlice';
import serverMemberReducer from './slices/serverMemberSlice';
import channelMemberReducer from './slices/channelMemberSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    serverRoot: serverRoot,
    fingerprint: fingerprintReducer,
    directMembers: directMemberReducer,
    serverMembers: serverMemberReducer,
    channelMembers: channelMemberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
