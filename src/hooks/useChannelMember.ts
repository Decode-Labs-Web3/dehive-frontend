import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ChannelMemberListProps } from "@/interfaces/call.interface";
import {
  Channels,
  UserStatusChangedPayload,
  UserJoinedChannelPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";
import {
  createMemberList,
  userJoinServer,
  userJoinChannel,
  userStatusChange,
  userLeftChannel,
  clearMemberList,
} from "@/store/slices/channelMemberSlice";

export const useChannelMember = () => {
  const dispatch = useAppDispatch();
  const channelMembers = useAppSelector((state) => state.channelMembers);

  const createChannelMember = (memberList: ChannelMemberListProps[]) => {
    dispatch(createMemberList(memberList));
  };

  const serverChannelMember = (memberList: Channels[]) => {
    dispatch(userJoinServer(memberList));
  };

  const joinChannelMember = (memberList: UserJoinedChannelPayload) => {
    dispatch(userJoinChannel(memberList));
  };

  const statusChannelMember = (memberList: UserStatusChangedPayload) => {
    dispatch(userStatusChange(memberList));
  };

  const leftChannelMember = (memberList: UserLeftChannelPayload) => {
    dispatch(userLeftChannel(memberList));
  };

  const deleteChannelMember = () => {
    dispatch(clearMemberList());
  };

  return {
    channelMembers,
    createChannelMember,
    serverChannelMember,
    joinChannelMember,
    statusChannelMember,
    leftChannelMember,
    deleteChannelMember,
  };
};
