import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import {
  setMemberList,
  updateMemberStatus,
  selectServerMembers,
} from "@/store/slices/serverMemberSlice";

interface UseServerMemberResult {
  serverMembers: ServerMemberListProps[];
  setServerMember: (memberList: ServerMemberListProps[]) => void;
  updateServerStatus: (userId: string, status: string) => void;
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

  const updateServerStatus = useCallback(
    (userId: string, status: string) => {
      dispatch(updateMemberStatus({ userId, status }));
    },
    [dispatch]
  );

  return {
    serverMembers,
    setServerMember,
    updateServerStatus,
  };
};
