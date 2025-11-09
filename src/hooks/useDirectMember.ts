import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DirectMemberListProps } from "@/interfaces/user.interface";
import {
  createMemberList,
  updateMemberStatus,
  updateMemberConversation,
  clearMemberList,
} from "@/store/slices/directMemberSlice";

export const useDirectMember = () => {
  const dispatch = useAppDispatch();
  const directMembers = useAppSelector((state) => state.directMembers);

  const createDirectMember = (memberList: DirectMemberListProps[]) => {
    dispatch(createMemberList(memberList));
  };

  const updateDirectStatus = (userId: string, status: string) => {
    dispatch(updateMemberStatus({ userId, status }));
  };

  const updateDirectConversation = (
    conversationId: string,
    status: string,
    isCall: boolean,
    lastMessageAt: string
  ) => {
    dispatch(
      updateMemberConversation({
        conversationId,
        status,
        isCall,
        lastMessageAt,
      })
    );
  };

  const deleteDirectMember = () => {
    dispatch(clearMemberList());
  };

  return {
    directMembers,
    createDirectMember,
    updateDirectStatus,
    updateDirectConversation,
    deleteDirectMember,
  };
};
