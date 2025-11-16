import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import {
  setMemberList,
  updateUserJoin,
  updateUserLeave,
  updateMemberStatus,
  selectServerMembers,
} from "@/store/slices/serverMemberSlice";

interface UseServerMemberResult {
  serverMembers: ServerMemberListProps[];
  updateUserLeaveMember: (userId: string) => void;
  setServerMember: (memberList: ServerMemberListProps[]) => void;
  updateUserJoinMember: (newMember: ServerMemberListProps) => void;
  updateServerStatusMember: (userId: string, status: string) => void;
}

export const useServerMember = (): UseServerMemberResult => {
  const dispatch = useAppDispatch();

  const serverMembers = useAppSelector(selectServerMembers);

  const setServerMember = useCallback(
    (memberList: ServerMemberListProps[]) => {
      dispatch(setMemberList(memberList));
    },
    [dispatch]
  );

  const updateServerStatusMember = useCallback(
    (userId: string, status: string) => {
      dispatch(updateMemberStatus({ userId, status }));
    },
    [dispatch]
  );

  const updateUserLeaveMember = useCallback(
    (userId: string) => {
      dispatch(updateUserLeave({ userId }));
    },
    [dispatch]
  );

  const updateUserJoinMember = useCallback(
    (newMember: ServerMemberListProps) => {
      dispatch(updateUserJoin(newMember));
    },
    [dispatch]
  );

  return {
    serverMembers,
    setServerMember,
    updateUserJoinMember,
    updateUserLeaveMember,
    updateServerStatusMember,
  };
};
