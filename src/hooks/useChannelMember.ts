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

  const createChannelMember = useCallback(
    (memberList: ChannelMemberListProps[]) => {
      dispatch(createMemberList(memberList));
    },
    [dispatch]
  );

  const serverChannelMember = useCallback(
    (memberList: Channels[]) => {
      dispatch(userJoinServer(memberList));
    },
    [dispatch]
  );

  const joinChannelMember = useCallback(
    (memberList: UserJoinedChannelPayload) => {
      dispatch(userJoinChannel(memberList));
    },
    [dispatch]
  );

  const statusChannelMember = useCallback(
    (memberList: UserStatusChangedPayload) => {
      dispatch(userStatusChange(memberList));
    },
    [dispatch]
  );

  const leftChannelMember = useCallback(
    (memberList: UserLeftChannelPayload) => {
      dispatch(userLeftChannel(memberList));
    },
    [dispatch]
  );

  const deleteChannelMember = useCallback(() => {
    dispatch(clearMemberList());
  }, [dispatch]);

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
