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
  setMemberList,
  userJoinServer,
  userJoinChannel,
  userStatusChange,
  userLeftChannel,
} from "@/store/slices/channelMemberSlice";

export const useChannelMember = () => {
  const dispatch = useAppDispatch();
  const channelMembers = useAppSelector((state) => state.channelMembers);

  const setChannelMember = (memberList: ChannelMemberListProps[]) => {
    dispatch(setMemberList(memberList));
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

  return {
    channelMembers,
    setChannelMember,
    serverChannelMember,
    joinChannelMember,
    statusChannelMember,
    leftChannelMember,
  };
};
