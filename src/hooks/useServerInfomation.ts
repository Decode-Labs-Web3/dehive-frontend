import { useCallback } from "react";
import { ServerProps } from "@/interfaces/server.interface";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  createServer,
  updateServer,
  updateServerNFT,
  updateSeverTags,
  selectServerInfomationState,
} from "@/store/slices/serverInfomationSlice";

export const useServerInfomation = () => {
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

  const updateServerTag = useCallback(
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

  return {
    serverInfomation,
    setServerInfomation,
    updateServerInfomation,
    updateServerTag,
    updateServerNFTInformation,
  };
};
