import { useCallback } from "react";
import { ServerProps } from "@/interfaces/server.interface";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectServerList,
  setServersList,
  createServer,
  deleteServer,
  editServerInfo,
  editSereverTags,
  editServerAvatar,
  editServerNFTGating,
  editOwnership,
} from "@/store/slices/serverListSlice";

export const useServersList = () => {
  const dispatch = useAppDispatch();
  const serversList = useAppSelector(selectServerList);

  const setServerList = useCallback(
    (servers: ServerProps[]) => {
      dispatch(setServersList(servers));
    },
    [dispatch]
  );

  const addServerList = useCallback(
    (server: ServerProps) => {
      dispatch(createServer(server));
    },
    [dispatch]
  );

  const removeServerList = useCallback(
    (serverId: string) => {
      dispatch(deleteServer({ serverId }));
    },
    [dispatch]
  );

  const updateServerInfomationList = useCallback(
    (serverId: string, name: string, description: string) => {
      dispatch(editServerInfo({ serverId, name, description }));
    },
    [dispatch]
  );

  const updateServerTagsList = useCallback(
    (serverId: string, tags: string) => {
      dispatch(editSereverTags({ serverId, tags }));
    },
    [dispatch]
  );

  const updateServerAvatarList = useCallback(
    (serverId: string, avatar_hash: string) => {
      dispatch(editServerAvatar({ serverId, avatar_hash }));
    },
    [dispatch]
  );

  const updateServerNFTGatingList = useCallback(
    (serverId: string, server: ServerProps) => {
      dispatch(editServerNFTGating({ serverId, server }));
    },
    [dispatch]
  );

  const updateServerOwnershipList = useCallback(
    (serverId: string, newOwnerId: string) => {
      dispatch(editOwnership({ serverId, newOwnerId }));
    },
    [dispatch]
  );

  return {
    serversList,
    setServerList,
    addServerList,
    removeServerList,
    updateServerInfomationList,
    updateServerTagsList,
    updateServerAvatarList,
    updateServerNFTGatingList,
    updateServerOwnershipList,
  };
};
