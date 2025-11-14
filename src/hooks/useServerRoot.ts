import { useCallback } from "react";
import { CategoryProps } from "@/interfaces/server.interface";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectServerRoot,
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
} from "@/store/slices/serverRootSlice";
interface UseServerRootResult {
  serverRoot: CategoryProps[];
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

  return {
    serverRoot,
    updateCategory,
    createCategory,
    createServerRoot,
    deleteCategoryRoot,
  };
};
