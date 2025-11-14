import { RootState } from "@/store/store";
import { CategoryProps } from "@/interfaces/server.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

const initialState: CategoryProps[] = [];

const serverRootSlice = createSlice({
  name: "serverRoot",
  initialState,
  reducers: {
    setServerRoot(_state, action: PayloadAction<CategoryProps[]>) {
      return action.payload;
    },
    setCategoryCreate(state, action: PayloadAction<CategoryProps>) {
      state.push(action.payload);
    },
    setCategoryUpdate(
      state,
      action: PayloadAction<{ categoryId: string; name: string }>
    ) {
      const { categoryId, name } = action.payload;
      const category = state.find((category) => category._id === categoryId);
      if (category) category.name = name;
    },
    setCategoryDelete(state, action: PayloadAction<{ categoryId: string }>) {
      const { categoryId } = action.payload;
      return state.filter((category) => category._id !== categoryId);
    },
  },
});

export const {
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
} = serverRootSlice.actions;
export default serverRootSlice.reducer;

export const selectServerRoot = (state: RootState) => state.serverRoot;

export const selectAllCategories = createSelector(
  [selectServerRoot],
  (categories) => categories
);
