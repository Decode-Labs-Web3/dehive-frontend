import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import serverRoot from "./slices/serverRootSlice";
import serverList from "./slices/serverListSlice";
import fingerprintReducer from "./slices/fingerprintSlice";
import directMemberReducer from "./slices/directMemberSlice";
import serverMemberReducer from "./slices/serverMemberSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    serverList: serverList,
    serverRoot: serverRoot,
    fingerprint: fingerprintReducer,
    directMembers: directMemberReducer,
    serverMembers: serverMemberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
