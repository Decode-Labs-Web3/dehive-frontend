import type { RootState } from "@/store/store";
import { UserDataProps } from "@/interfaces/user.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserDataProps = {
  _id: "",
  dehive_role: "",
  status: "",
  server_count: 0,
  username: "",
  display_name: "",
  bio: "",
  avatar_ipfs_hash: "",
  last_login: "",
  following_number: 0,
  followers_number: 0,
  is_active: false,
  last_account_deactivation: "",
};

type UpdateUserPayload = {
  avatar_ipfs_hash: string;
  display_name: string;
  bio: string;
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    createUser(_state, action: PayloadAction<UserDataProps>) {
      return action.payload;
    },
    updateUser(state, action: PayloadAction<UpdateUserPayload>) {
      Object.assign(state, action.payload);
    },
  },
});

export const { createUser, updateUser } = userSlice.actions;
export default userSlice.reducer;

const selectUserState = (state: RootState) => state.user;

export const selectUser = selectUserState;
