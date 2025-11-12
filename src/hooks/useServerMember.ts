import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import {
  createMemberList,
  updateMemberStatus,
  clearMemberList,
} from "@/store/slices/serverMemberSlice";

export const useServerMember = () => {
  const dispatch = useAppDispatch();
  const serverMembers = useAppSelector((state) => state.serverMembers);

  const createServerMember = useCallback((memberList: ServerMemberListProps[]) => {
    dispatch(createMemberList(memberList));
  }, [dispatch]);

  const updateServerStatus = useCallback((userId: string, status: string) => {
    dispatch(updateMemberStatus({ userId, status }));
  }, [dispatch]);

  const deleteServerMember = useCallback(() => {
    dispatch(clearMemberList());
  }, [dispatch]);

  return {
    serverMembers,
    createServerMember,
    updateServerStatus,
    deleteServerMember,
  };
};
