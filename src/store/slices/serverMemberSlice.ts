import { ServerMemberListProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ServerMemberListProps[] = [];

const serverMemberSlice = createSlice({
  name: "serverMembers",
  initialState,
  reducers: {
    createMemberList(_state, action: PayloadAction<ServerMemberListProps[]>) {
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
    clearMemberList() {
      return initialState;
    },
  },
});

export const { createMemberList, updateMemberStatus, clearMemberList } =
  serverMemberSlice.actions;
export default serverMemberSlice.reducer;
