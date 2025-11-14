import { RootState } from "@/store/store";
import { CategoryProps, ChannelProps } from "@/interfaces/server.interface";
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
    setChannelMove(
      state,
      action: PayloadAction<{
        sourceCategoryId: string;
        targetCategoryId: string;
        channelId: string;
      }>
    ) {
      const { sourceCategoryId, targetCategoryId, channelId } = action.payload;

      const sourceCategory = state.find((category) => category._id === sourceCategoryId);
      const targetCategory = state.find((category) => category._id === targetCategoryId);

      if (!sourceCategory || !targetCategory) return;

      const index = sourceCategory.channels.findIndex(
        (channel) => channel._id === channelId
      );
      if (index === -1) return;

      const [movedChannel] = sourceCategory.channels.splice(index, 1);
      targetCategory.channels.push(movedChannel);
    },
    setChannelCreate (state, action: PayloadAction<ChannelProps>) {
      const channel = action.payload;
      const category = state.find((category) => category._id === channel.category_id);
      if (category) {
        category.channels.push(channel);
      }
    },
    setChannelEdit(state, actions: PayloadAction<{channelId: string, name: string}>) {
      const { channelId, name } = actions.payload;
      state.forEach((category) => {
        const channel = category.channels.find(
          (channel) => channel._id === channelId
        );
        if (channel) {
          channel.name = name;
        }
      });
    },
    setChannelDeleteRoot(state, action: PayloadAction<{ channelId: string }>) {
      const { channelId } = action.payload;
      state.forEach((category) => {
        category.channels = category.channels.filter(
          (channel) => channel._id !== channelId
        );
      });
    },
  },
});

export const {
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
  setChannelMove,
  setChannelCreate,
  setChannelEdit,
  setChannelDeleteRoot,
} = serverRootSlice.actions;
export default serverRootSlice.reducer;

export const selectServerRoot = (state: RootState) => state.serverRoot;

export const selectAllCategories = createSelector(
  [selectServerRoot],
  (categories) => categories
);
