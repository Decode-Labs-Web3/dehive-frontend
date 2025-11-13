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
  selectChannelMembers,
  setCategoryDelete,
  setChannelMove,
  setChannelCreate,
  setChannelDelete,
} from "@/store/slices/channelMemberSlice";

export const useChannelMember = () => {
  const dispatch = useAppDispatch();
  const channelMembers = useAppSelector(selectChannelMembers);

  const setChannelMember = useCallback(
    (memberList: ChannelMemberListProps[]) => {
      dispatch(setMemberList(memberList));
    },
    [dispatch]
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      dispatch(setCategoryDelete({ categoryId }));
    },
    [dispatch]
  );

  const moveChannel = useCallback(
    (channelId: string, categoryId: string) => {
      dispatch(setChannelMove({ channelId, categoryId }));
    },
    [dispatch]
  );

  const createChannel = useCallback(
    (channel: ChannelMemberListProps) => {
      dispatch(setChannelCreate(channel));
    },
    [dispatch]
  );

  const deleteChannel = useCallback(
    (channelId: string) => {
      dispatch(setChannelDelete({ channelId }));
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

  return {
    channelMembers,
    setChannelMember,
    serverChannelMember,
    joinChannelMember,
    statusChannelMember,
    leftChannelMember,
    deleteCategory,
    moveChannel,
    createChannel,
    deleteChannel,
  };
};
