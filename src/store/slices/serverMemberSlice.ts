import type { RootState } from "@/store/store";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    updateUserJoin(state, action: PayloadAction<ServerMemberListProps>) {
      const newMember = action.payload;
      const isExist = state.some(
        (member) => member.user_id === newMember.user_id
      );
      if (isExist) return;
      state.push(newMember);
    },
    updateUserLeave(state, action: PayloadAction<{ userId: string }>) {
      const { userId } = action.payload;
      return state.filter((member) => member.user_id !== userId);
    },
  },
});

export const { setMemberList, updateMemberStatus, updateUserLeave, updateUserJoin } = serverMemberSlice.actions;
export default serverMemberSlice.reducer;

export const selectServerMembers = (state: RootState) => state.serverMembers;
