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

  const createServerMember = (memberList: ServerMemberListProps[]) => {
    dispatch(createMemberList(memberList));
  };

  const updateServerStatus = (userId: string, status: string) => {
    dispatch(updateMemberStatus({ userId, status }));
  };
  const deleteServerMember = () => {
    dispatch(clearMemberList());
  };

  return {
    serverMembers,
    createServerMember,
    updateServerStatus,
    deleteServerMember,
  };
};
