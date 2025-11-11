import { UserDataProps } from "@/interfaces/user.interface";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useCallback } from "react";

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const updateUser = useCallback(
    (fullUser: UserDataProps) => {
      dispatch(setUser(fullUser));
    },
    [dispatch]
  );

  const deleteUser = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  return {
    user,
    updateUser,
    deleteUser,
  };
};
