import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CategoryProps, ChannelProps } from "@/interfaces/server.interface";
import {
  Channels,
  UserStatusChangedPayload,
  UserJoinedChannelPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";
import {
  selectServerRoot,
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
  setChannelMove,
  setChannelDelete,
  setChannelEdit,
  setChannelCreate,
  userJoinServer,
  userJoinChannel,
  userLeftChannel,
  userStatusChanged,
} from "@/store/slices/serverRootSlice";
interface UseServerRootResult {
  serverRoot: CategoryProps[];
  moveChannelRoot: (
    sourceCategoryId: string,
    targetCategoryId: string,
    channelId: string
  ) => void;
  createChannelRoot: (channel: ChannelProps) => void;
  editChannelRoot: (channelId: string, name: string) => void;
  deleteChannelRoot: (channelId: string) => void;
  deleteCategoryRoot: (categoryId: string) => void;
  createCategory: (category: CategoryProps) => void;
  updateCategory: (categoryId: string, name: string) => void;
  createServerRoot: (categories: CategoryProps[]) => void;
  userJoinServerRoot: (channelList: Channels[]) => void;
  userJoinChannelRoot: (payload: UserJoinedChannelPayload) => void;
  userLeftChannelRoot: (payload: UserLeftChannelPayload) => void;
  userStatusChangeRoot: (payload: UserStatusChangedPayload) => void;
}

export const useServerRoot = (): UseServerRootResult => {
  const dispatch = useAppDispatch();
  const serverRoot = useAppSelector(selectServerRoot);

  const createServerRoot = useCallback(
    (categories: CategoryProps[]) => {
      dispatch(setServerRoot(categories));
    },
    [dispatch]
  );

  const createCategory = useCallback(
    (category: CategoryProps) => {
      dispatch(setCategoryCreate(category));
    },
    [dispatch]
  );

  const updateCategory = useCallback(
    (categoryId: string, name: string) => {
      dispatch(setCategoryUpdate({ categoryId, name }));
    },
    [dispatch]
  );

  const deleteCategoryRoot = useCallback(
    (categoryId: string) => {
      dispatch(setCategoryDelete({ categoryId }));
    },
    [dispatch]
  );

  const moveChannelRoot = useCallback(
    (sourceCategoryId: string, targetCategoryId: string, channelId: string) => {
      dispatch(
        setChannelMove({ sourceCategoryId, targetCategoryId, channelId })
      );
    },
    [dispatch]
  );

  const createChannelRoot = useCallback(
    (channel: ChannelProps) => {
      dispatch(setChannelCreate(channel));
    },
    [dispatch]
  );

  const editChannelRoot = useCallback(
    (channelId: string, name: string) => {
      dispatch(setChannelEdit({ channelId, name }));
    },
    [dispatch]
  );

  const deleteChannelRoot = useCallback(
    (channelId: string) => {
      dispatch(setChannelDelete({ channelId }));
    },
    [dispatch]
  );

  const userJoinServerRoot = useCallback(
    (channelList: Channels[]) => {
      dispatch(userJoinServer(channelList));
    },
    [dispatch]
  );

  const userJoinChannelRoot = useCallback(
    (payload: UserJoinedChannelPayload) => {
      dispatch(userJoinChannel(payload));
    },
    [dispatch]
  );

  const userLeftChannelRoot = useCallback(
    (payload: UserLeftChannelPayload) => {
      dispatch(userLeftChannel(payload));
    },
    [dispatch]
  );

  const userStatusChangeRoot = useCallback(
    (payload: UserStatusChangedPayload) => {
      dispatch(userStatusChanged(payload));
    },
    [dispatch]
  );

  return {
    serverRoot,
    updateCategory,
    moveChannelRoot,
    createCategory,
    createServerRoot,
    deleteCategoryRoot,
    deleteChannelRoot,
    editChannelRoot,
    createChannelRoot,
    userJoinServerRoot,
    userJoinChannelRoot,
    userLeftChannelRoot,
    userStatusChangeRoot,
  };
};
