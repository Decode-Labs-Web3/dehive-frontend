import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DirectMemberListProps } from "@/interfaces/user.interface";
import {
  setMemberList,
  updateMemberStatus,
  selectDirectMembers,
  updateMemberConversation,
} from "@/store/slices/directMemberSlice";

interface UseDirectMemberResult {
  directMembers: DirectMemberListProps[];
  setDirectMember: (memberList: DirectMemberListProps[]) => void;
  updateDirectStatus: (userId: string, status: string) => void;
  updateDirectConversation: (
    conversationId: string,
    status: string,
    isCall: boolean,
    lastMessageAt: string
  ) => void;
}

export const useDirectMember = (): UseDirectMemberResult => {
  const dispatch = useAppDispatch();
  const directMembers = useAppSelector(selectDirectMembers);

  const setDirectMember = useCallback(
    (memberList: DirectMemberListProps[]) => {
      dispatch(setMemberList(memberList));
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

  return {
    directMembers,
    setDirectMember,
    updateDirectStatus,
    updateDirectConversation,
  };
};
