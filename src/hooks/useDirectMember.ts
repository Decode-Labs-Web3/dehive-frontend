import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useCallback } from "react";
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

  const createDirectMember = useCallback(
    (memberList: DirectMemberListProps[]) => {
      dispatch(createMemberList(memberList));
    },
    [dispatch]
  );

  const updateDirectStatus = useCallback(
    (userId: string, status: string) => {
      dispatch(updateMemberStatus({ userId, status }));
    },
    [dispatch]
  );

  const updateDirectConversation = useCallback(
    (
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
    },
    [dispatch]
  );

  const deleteDirectMember = useCallback(() => {
    dispatch(clearMemberList());
  }, [dispatch]);

  return {
    directMembers,
    createDirectMember,
    updateDirectStatus,
    updateDirectConversation,
    deleteDirectMember,
  };
};
