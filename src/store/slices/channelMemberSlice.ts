import { RootState } from "@/store/store";
import { ChannelMemberListProps } from "@/interfaces/call.interface";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import {
  Channels,
  UserStatusChangedPayload,
  UserJoinedChannelPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";

const initialState: ChannelMemberListProps[] = [];

const channelMemberSlice = createSlice({
  name: "channelMembers",
  initialState,
  reducers: {
    setMemberList(_state, action: PayloadAction<ChannelMemberListProps[]>) {
      return action.payload;
    },
    setCategoryDelete(state, action: PayloadAction<{ categoryId: string }>) {
      const { categoryId } = action.payload;
      return state.filter((channel) => channel.category_id !== categoryId);
    },
    setChannelMove(
      state,
      action: PayloadAction<{ channelId: string; categoryId: string }>
    ) {
      const { channelId, categoryId } = action.payload;
      return state.map((channel) =>
        channel._id === channelId
          ? { ...channel, category_id: categoryId }
          : channel
      );
    },
    setChannelCreate(state, action: PayloadAction<ChannelMemberListProps>) {
      state.push(action.payload);
    },
    setChannelDelete(state, action: PayloadAction<{ channelId: string }>) {
      const { channelId } = action.payload;
      return state.filter((channel) => channel._id !== channelId);
    },
    userJoinServer(state, action: PayloadAction<Channels[]>) {
      state.forEach((stateChannel) => {
        const index = action.payload.findIndex(
          (payloadChannel) => payloadChannel.channel_id === stateChannel._id
        );
        if (index !== -1) {
          stateChannel.participants = action.payload[index].participants;
        }
      });
    },
    userJoinChannel(state, action: PayloadAction<UserJoinedChannelPayload>) {
      const { channel_id, user_info } = action.payload;

      const channel = state.find((channel) => channel._id === channel_id);
      if (!channel) return;

      if (!channel.participants) {
        channel.participants = [user_info];
        return;
      }

      const idx = channel.participants.findIndex(
        (user) => user._id === user_info._id
      );

      if (idx === -1) {
        channel.participants.push(user_info);
      } else {
        channel.participants[idx] = user_info;
      }
    },
    userStatusChange(state, action: PayloadAction<UserStatusChangedPayload>) {
      const channel = state.find(
        (channel) => channel._id === action.payload.channel_id
      );
      if (channel && channel.participants) {
        channel.participants = channel.participants.map((user) =>
          user._id === action.payload.user_info._id
            ? action.payload.user_info
            : user
        );
      }
    },
    userLeftChannel(state, action: PayloadAction<UserLeftChannelPayload>) {
      const channel = state.find(
        (channel) => channel._id === action.payload.channel_id
      );
      if (channel && channel.participants) {
        channel.participants = channel.participants.filter(
          (user) => user._id !== action.payload.user_id
        );
      }
    },
  },
});

export const {
  setMemberList,
  userJoinServer,
  userJoinChannel,
  userStatusChange,
  userLeftChannel,
  setCategoryDelete,
  setChannelMove,
  setChannelCreate,
  setChannelDelete,
} = channelMemberSlice.actions;
export default channelMemberSlice.reducer;

const selectChannelMembersState = (state: RootState) => state.channelMembers;

export const selectChannelMembers = createSelector(
  [selectChannelMembersState],
  (members) => members
);
