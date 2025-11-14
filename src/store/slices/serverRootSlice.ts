import { RootState } from "@/store/store";
import { CategoryProps, ChannelProps } from "@/interfaces/server.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import {
  Channels,
  UserStatusChangedPayload,
  UserJoinedChannelPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";

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

      const sourceCategory = state.find(
        (category) => category._id === sourceCategoryId
      );
      const targetCategory = state.find(
        (category) => category._id === targetCategoryId
      );

      if (!sourceCategory || !targetCategory) return;

      const index = sourceCategory.channels.findIndex(
        (channel) => channel._id === channelId
      );
      if (index === -1) return;

      const [movedChannel] = sourceCategory.channels.splice(index, 1);
      targetCategory.channels.push(movedChannel);
    },
    setChannelCreate(state, action: PayloadAction<ChannelProps>) {
      const channel = action.payload;
      const category = state.find(
        (category) => category._id === channel.category_id
      );
      if (category) {
        category.channels.push(channel);
      }
    },
    setChannelEdit(
      state,
      actions: PayloadAction<{ channelId: string; name: string }>
    ) {
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
    setChannelDelete(state, action: PayloadAction<{ channelId: string }>) {
      const { channelId } = action.payload;
      state.forEach((category) => {
        category.channels = category.channels.filter(
          (channel) => channel._id !== channelId
        );
      });
    },
    userJoinServer(state, action: PayloadAction<Channels[]>) {
      state.forEach((category) => {
        category.channels.forEach((channel) => {
          const index = action.payload.findIndex(
            (payloadChannel) => payloadChannel.channel_id === channel._id
          );
          if (index !== -1) {
            channel.participants = action.payload[index].participants;
          }
        });
      });
    },
    userJoinChannel(state, action: PayloadAction<UserJoinedChannelPayload>) {
      const { channel_id, user_id, user_info } = action.payload;
      state.forEach((category) => {
        const channel = category.channels.find(
          (channel) => channel._id === channel_id
        );
        if (
          channel &&
          !channel.participants?.find((user) => user._id === user_id)
        ) {
          channel.participants?.push(user_info);
        }
      });
    },
    userLeftChannel(state, action: PayloadAction<UserLeftChannelPayload>) {
      const { channel_id, user_id } = action.payload;
      state.forEach((category) => {
        const channel = category.channels.find(
          (channel) => channel._id === channel_id
        );
        if (channel) {
          channel.participants = channel.participants?.filter(
            (user) => user._id !== user_id
          );
        }
      });
    },
    userStatusChanged(state, action: PayloadAction<UserStatusChangedPayload>) {
      const { channel_id, user_info } = action.payload;

      state.forEach((category) => {
        const channel = category.channels.find(
          (channel) => channel._id === channel_id
        );
        if (channel && channel.participants) {
          channel.participants = channel.participants.map((user) =>
            user._id === user_info._id ? user_info : user
          );
        }
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
  setChannelDelete,
  userJoinServer,
  userJoinChannel,
  userLeftChannel,
  userStatusChanged,
} = serverRootSlice.actions;
export default serverRootSlice.reducer;

export const selectServerRoot = (state: RootState) => state.serverRoot;

export const selectAllCategories = createSelector(
  [selectServerRoot],
  (categories) => categories
);
