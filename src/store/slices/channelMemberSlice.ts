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
      state
        .find((channel) => channel._id === action.payload.channel_id)
        ?.participants?.push(action.payload.user_info);
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
} = channelMemberSlice.actions;
export default channelMemberSlice.reducer;

const selectChannelMembersState = (state: RootState) => state.channelMembers;

export const selectChannelMembers = createSelector(
  [selectChannelMembersState],
  (members) => members
);
