import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count += 1; },
    reset: (state) => { state.count = 0; },
  },
});

export const { increment, reset } = notificationSlice.actions;
export default notificationSlice.reducer;
