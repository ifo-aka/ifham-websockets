// src/store/slices/videoCallSlice.js
import { createSlice } from "@reduxjs/toolkit";

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState: {
    inCall: false,
    isReceivingCall: false,
    caller: null,
    offer: null,
    isCalling: false,
    remoteStreamAvailable: false,


  },
  reducers: {
    setInCall: (state, action) => {
      state.inCall = action.payload;
    },
    setIsReceivingCall: (state, action) => {
      state.isReceivingCall = action.payload;
    },
    setCaller: (state, action) => {
      state.caller = action.payload;
    },
    setOffer: (state, action) => {
      state.offer = action.payload;
    },
    setIsCalling: (state, action) => {
      state.isCalling = action.payload;
    },
    setRemoteStreamAvailable: (state, action) => {
      state.remoteStreamAvailable = action.payload;
    },
  },
});

export const {
  setInCall,
  setIsReceivingCall,
  setCaller,
  setOffer,
  setIsCalling,
  setRemoteStreamAvailable,
} = videoCallSlice.actions;

export default videoCallSlice.reducer;
