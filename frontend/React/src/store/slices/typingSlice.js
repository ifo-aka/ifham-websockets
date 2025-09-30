import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  typingUsers: {}, // e.g., { "034...": true }
};

const typingSlice = createSlice({
  name: 'typing',
  initialState,
  reducers: {
    startTyping: (state, action) => {
      const { contactPhoneNumber } = action.payload;
      state.typingUsers[contactPhoneNumber] = true;
    },
    stopTyping: (state, action) => {
      const { contactPhoneNumber } = action.payload;
      delete state.typingUsers[contactPhoneNumber];
    },
  },
});

export const { startTyping, stopTyping } = typingSlice.actions;
export default typingSlice.reducer;
