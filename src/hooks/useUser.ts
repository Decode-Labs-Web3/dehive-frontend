import { UserDataProps } from "@/interfaces/user.interface";
import { createUser, updateUser, selectUser } from "@/store/slices/userSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useCallback } from "react";

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const setUser = useCallback(
    (fullUser: UserDataProps) => {
      dispatch(createUser(fullUser));
    },
    [dispatch]
  );

  const updateUserDetail = useCallback(
    (avatar_ipfs_hash: string, display_name: string, bio: string) => {
      dispatch(updateUser({ avatar_ipfs_hash, display_name, bio }));
    },
    [dispatch]
  );

  return {
    user,
    setUser,
    updateUserDetail,
  };
};
