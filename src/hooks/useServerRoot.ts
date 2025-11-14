import { useCallback } from "react";
import { CategoryProps, ChannelProps } from "@/interfaces/server.interface";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectServerRoot,
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
  setChannelMove,
  setChannelDeleteRoot,
  setChannelEdit,
  setChannelCreate,
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
      dispatch(setChannelDeleteRoot({ channelId }));
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
  };
};
