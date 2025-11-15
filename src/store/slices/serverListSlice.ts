import type { RootState } from "@/store/store";
import { ServerProps } from "@/interfaces/server.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

const initialState: ServerProps[] = [];

const serverListSlice = createSlice({
  name: "serverList",
  initialState,
  reducers: {
    setServersList(_state, action: PayloadAction<ServerProps[]>) {
      return action.payload;
    },
    createServer(state, actions: PayloadAction<ServerProps>) {
      state.push(actions.payload);
    },
    editServerInfo(
      state,
      actions: PayloadAction<{
        serverId: string;
        name: string;
        description: string;
      }>
    ) {
      const { serverId, name, description } = actions.payload;
      const server = state.find((server) => server._id === serverId);
      if (server) {
        server.name = name;
        server.description = description;
      }
    },
    editSereverTags(
      state,
      actions: PayloadAction<{ serverId: string; tags: string }>
    ) {
      const { serverId, tags } = actions.payload;
      const server = state.find((server) => server._id === serverId);
      if (server) {
        server.tags = [tags];
      }
    },
    editServerAvatar(
      state,
      actions: PayloadAction<{ serverId: string; avatar_hash: string }>
    ) {
      const { serverId, avatar_hash } = actions.payload;
      const server = state.find((server) => server._id === serverId);
      if (server) {
        server.avatar_hash = avatar_hash;
      }
    },
    editServerNFTGating(
      state,
      actions: PayloadAction<{ serverId: string; server: ServerProps }>
    ) {
      const { serverId, server: updatedServer } = actions.payload;
      const serverIndex = state.findIndex((server) => server._id === serverId);
      if (serverIndex !== -1) {
        state[serverIndex] = {
          ...state[serverIndex],
          nft_gated: updatedServer.nft_gated,
        };
      }
    },
    deleteServer(state, actions: PayloadAction<{ serverId: string }>) {
      const { serverId } = actions.payload;
      return state.filter((server) => server._id !== serverId);
    },
  },
});

export const {
  setServersList,
  createServer,
  editServerInfo,
  editSereverTags,
  editServerAvatar,
  editServerNFTGating,
  deleteServer,
} = serverListSlice.actions;
export default serverListSlice.reducer;

const selectServerListState = (state: RootState) => state.serverList;

export const selectServerList = createSelector(
  [selectServerListState],
  (servers) => servers
);
