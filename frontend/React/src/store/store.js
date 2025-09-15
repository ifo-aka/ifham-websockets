import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlics";
export const store = configureStore({
  reducer: {
    // auth: authReducer,
       ui : uiReducer,
       auth: authReducer,
  },
});

export default store;
