import { ChannelMemberListProps } from "../../interfaces/call.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ChannelMemberListProps[] = [];

const channelMemberSlice = createSlice({
  name: "directMembers",
  initialState,
  reducers: {
    createMemberList(_state, action: PayloadAction<ChannelMemberListProps[]>) {
      return action.payload;
    },
    clearMemberList() {
      return initialState;
    },
  },
});

export const {
  createMemberList,
  clearMemberList,
} = channelMemberSlice.actions;
export default channelMemberSlice.reducer;
