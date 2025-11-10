import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ChannelMemberListProps } from "@/interfaces/call.interface";
import {
  createMemberList,
  clearMemberList } from "@/store/slices/channelMemberSlice"

export const useChannelMember = () => {
  const dispatch = useAppDispatch();
  const channelMembers = useAppSelector((state) => state.channelMembers);

  const createChannelMember = (memberList: ChannelMemberListProps[]) => {
    dispatch(createMemberList(memberList));
  };

  const deleteChannelMember = () => {
    dispatch(clearMemberList());
  };

  return {
    channelMembers,
    createChannelMember,
    deleteChannelMember,
  };
};
