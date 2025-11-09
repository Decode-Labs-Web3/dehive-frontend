import { DirectMemberListProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: DirectMemberListProps[] = [];

const directMemberSlice = createSlice({
  name: "directMembers",
  initialState,
  reducers: {
    createMemberList(_state, action: PayloadAction<DirectMemberListProps[]>) {
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
    updateMemberConversation(
      state,
      action: PayloadAction<{
        conversationId: string;
        status: string;
        isCall: boolean;
        lastMessageAt: string;
      }>
    ) {
      const { conversationId, status, isCall, lastMessageAt } = action.payload;
      const memberIndex = state.findIndex(
        (member) => member.conversationid === conversationId
      );
      if (memberIndex !== -1) {
        state[memberIndex] = {
          ...state[memberIndex],
          status,
          isCall,
          lastMessageAt,
        };
        state.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );
      } else {
        console.warn(
          `Member with conversation ID ${conversationId} not found.`
        );
      }
    },
    clearMemberList() {
      return initialState;
    },
  },
});

export const {
  createMemberList,
  updateMemberStatus,
  updateMemberConversation,
  clearMemberList,
} = directMemberSlice.actions;
export default directMemberSlice.reducer;
