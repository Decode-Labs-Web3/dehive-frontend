import type { RootState } from "@/store/store";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

const initialState: ServerMemberListProps[] = [];

const serverMemberSlice = createSlice({
  name: "serverMembers",
  initialState,
  reducers: {
    setMemberList(_state, action: PayloadAction<ServerMemberListProps[]>) {
      return action.payload;
    },
    updateMemberStatus(
      state,
      action: PayloadAction<{ userId: string; status: string }>
    ) {
      const { userId, status } = action.payload;
      const memberIndex = state.findIndex(
        (member) => member.user_id === userId
      );
      if (memberIndex !== -1) {
        state[memberIndex].status = status;
      }
    },
  },
});

export const { setMemberList, updateMemberStatus } =
  serverMemberSlice.actions;
export default serverMemberSlice.reducer;

const selectServerMembersState = (state: RootState) => state.serverMembers;

export const selectServerMembers = createSelector(
  [selectServerMembersState],
  (members) => members
);
