import type { RootState } from "@/store/store";
import type { ServerProps } from "@/interfaces/server.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

const initialState: ServerProps = {
  _id: "",
  name: "",
  description: "",
  owner_id: "",
  member_count: 0,
  is_private: false,
  tags: [],
  createdAt: "",
  updatedAt: "",
  __v: 0,
};

const serverInfoSlice = createSlice({
  name: "serverInfomation",
  initialState,
  reducers: {
    createServer(_state, action: PayloadAction<ServerProps>) {
      return action.payload;
    },
    updateServer(
      state,
      action: PayloadAction<{ name: string; description: string }>
    ) {
      const { name, description } = action.payload;
      state.name = name;
      state.description = description;
    },
    updateSeverTags(state, action: PayloadAction<{ tag: string }>) {
      const { tag } = action.payload;
      state.tags = [tag];
    },
    updateServerNFT(_state, action: PayloadAction<ServerProps>) {
      return action.payload;
    },
    deleteServer() {
      return initialState;
    },
  },
});

export const { createServer, updateServer, updateSeverTags, updateServerNFT, deleteServer } =
  serverInfoSlice.actions;
export default serverInfoSlice.reducer;

const selectServerInfomation = (state: RootState) => state.serverInfomation;

export const selectServerInfomationState = createSelector(
  [selectServerInfomation],
  (server) => server
);
