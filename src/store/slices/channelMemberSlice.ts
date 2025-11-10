import { ChannelMemberListProps } from "../../interfaces/call.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChannelMemberListProps[] = [];

const channelMemberSlice = createSlice({
  name: "channelMembers",
  initialState,
  reducers: {
    createMemberList(_state, action: PayloadAction<ChannelMemberListProps[]>) {
      return action.payload;
    },
    userJoinServer(state, action: PayloadAction<ChannelMemberListProps>) {
      state.push(action.payload);
    },
    userJoinChannel(state, action: PayloadAction<ChannelMemberListProps>) {
      state.push(action.payload);
    },
    userStatusChange(state, action: PayloadAction<ChannelMemberListProps>) {
      state.push(action.payload);
    },
    userLeftChannel(state, action: PayloadAction<ChannelMemberListProps>) {
      state.push(action.payload);
    },
    clearMemberList() {
      return initialState;
    },
  },
});

export const { createMemberList, clearMemberList } = channelMemberSlice.actions;
export default channelMemberSlice.reducer;
