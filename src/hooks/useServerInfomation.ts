import { useCallback } from "react";
import { ServerProps } from "@/interfaces/server.interface";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  createServer,
  updateServer,
  updateServerNFT,
  updateSeverTags,
  selectServerInfomationState,
  deleteServer,
  updateOwnership,
  updateServerAvatar,
} from "@/store/slices/serverInfomationSlice";

interface UseServerInfomationResult {
  serverInfomation: ServerProps;
  setServerInfomation: (server: ServerProps) => void;
  updateServerInfomation: (name: string, description: string) => void;
  updateServerTagInfomation: (tag: string) => void;
  updateServerNFTInformation: (server: ServerProps) => void;
  removeServerInfomation: () => void;
  updateServerOwnershipInfomation: (newOwnerId: string) => void;
  updateServerAvatarInfomation: (avatar_hash: string) => void;
}

export const useServerInfomation = (): UseServerInfomationResult => {
  const dispatch = useAppDispatch();
  const serverInfomation = useAppSelector(selectServerInfomationState);

  const setServerInfomation = useCallback(
    (server: ServerProps) => {
      dispatch(createServer(server));
    },
    [dispatch]
  );

  const updateServerInfomation = useCallback(
    (name: string, description: string) => {
      dispatch(updateServer({ name, description }));
    },
    [dispatch]
  );

  const updateServerTagInfomation = useCallback(
    (tag: string) => {
      dispatch(updateSeverTags({ tag }));
    },
    [dispatch]
  );

  const updateServerNFTInformation = useCallback(
    (server: ServerProps) => {
      dispatch(updateServerNFT(server));
    },
    [dispatch]
  );

  const removeServerInfomation = useCallback(() => {
    dispatch(deleteServer());
  }, [dispatch]);

  const updateServerAvatarInfomation = useCallback(
    (avatar_hash: string) => {
      dispatch(updateServerAvatar({ avatar_hash }));
    },
    [dispatch]
  );

  const updateServerOwnershipInfomation = useCallback(
    (newOwnerId: string) => {
      dispatch(updateOwnership({ newOwnerId }));
    },
    [dispatch]
  );

  return {
    serverInfomation,
    setServerInfomation,
    updateServerInfomation,
    updateServerTagInfomation,
    updateServerNFTInformation,
    removeServerInfomation,
    updateServerOwnershipInfomation,
    updateServerAvatarInfomation,
  };
};
