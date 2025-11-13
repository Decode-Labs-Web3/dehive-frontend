import { RootState } from "@/store/store";
import { DirectMemberListProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

const initialState: DirectMemberListProps[] = [];

type UpdateMemberConversationPayload = {
  conversationId: string;
  status: string;
  isCall: boolean;
  lastMessageAt: string;
};

const sortByLastMessage = (state: DirectMemberListProps[]) => {
  state.sort((a, b) => {
    const timeA = new Date(a.lastMessageAt).getTime();
    const timeB = new Date(b.lastMessageAt).getTime();
    return timeB - timeA;
  });
};

const directMemberSlice = createSlice({
  name: "directMembers",
  initialState,
  reducers: {
    setMemberList(_state, action: PayloadAction<DirectMemberListProps[]>) {
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

    updateMemberConversation(state, action: PayloadAction<UpdateMemberConversationPayload>) {
      const { conversationId, status, isCall, lastMessageAt } = action.payload;
      const member = state.find((member) => member.conversationid === conversationId);

      if (!member) {
        console.warn(
          `Member with conversation ID ${conversationId} not found.`
        );
        return;
      }

      member.status = status;
      member.isCall = isCall;
      member.lastMessageAt = lastMessageAt;

      sortByLastMessage(state);
    },
  },
});

export const {
  setMemberList,
  updateMemberStatus,
  updateMemberConversation,
} = directMemberSlice.actions;
export default directMemberSlice.reducer;

const selectDirectMembersState = (state: RootState) => state.directMembers;

export const selectDirectMembers = createSelector(
  [selectDirectMembersState],
  (members) => members
);
