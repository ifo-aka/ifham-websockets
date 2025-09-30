import { createSlice } from "@reduxjs/toolkit";

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState: {
    inCall: false,
    isReceivingCall: false,
    caller: null,
    offer: null,
    remoteStream: null,
    localStream: null, // 👈 add this
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
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    setLocalStream: (state, action) => {   // 👈 add this
      state.localStream = action.payload;
    },
  },
});

export const {
  setInCall,
  setIsReceivingCall,
  setCaller,
  setOffer,
  setRemoteStream,
  setLocalStream,   // 👈 export it
} = videoCallSlice.actions;

export default videoCallSlice.reducer;
