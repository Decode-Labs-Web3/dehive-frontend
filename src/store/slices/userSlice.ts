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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(_state, action: PayloadAction<UserDataProps>) {
      return action.payload;
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
