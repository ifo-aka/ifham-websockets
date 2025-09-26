import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userStatus: {}, // e.g., { "034..." : { status: "ONLINE" | "OFFLINE", lastSeen: null | ISOString } }
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    updateUserStatus: (state, action) => {
      const { userId, status, lastSeen = null } = action.payload;
      state.userStatus[userId] = { status, lastSeen };
    },
  },
});

export const { updateUserStatus } = presenceSlice.actions;
export default presenceSlice.reducer;
