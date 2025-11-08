import { UserDataProps } from "@/interfaces/user.interface";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const updateUser = (fullUser: UserDataProps) => {
    dispatch(setUser(fullUser));
  };

  const deleteUser = () => {
    dispatch(clearUser());
  };

  return {
    user,
    updateUser,
    deleteUser,
  };
};
