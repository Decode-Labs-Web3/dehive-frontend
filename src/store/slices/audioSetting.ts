import {  createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioState {
  microphone: boolean;
  speaker: boolean;
}

const initialState: AudioState = {
  microphone: false,
  speaker: false,
};

const audioSlice = createSlice({
  name: 'audioSetting',
  initialState,
  reducers: {
    
    setMicrophone(state, action: PayloadAction<boolean>) {
      state.microphone = action.payload;
    },
    setSpeaker(state, action: PayloadAction<boolean>) {
      state.speaker = action.payload;
    }
  },
});

export const { setMicrophone, setSpeaker } = audioSlice.actions;

export default audioSlice.reducer;
