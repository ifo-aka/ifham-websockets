import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlics";
import notificationReducer from "./slices/notificationSlice";
import chatReducer from "./slices/chatSlice"; 
import contactReducer from "./slices/contactsSlice";
export const store = configureStore({
  reducer: {
    // auth: authReducer,
       ui : uiReducer,
       auth: authReducer,
        notification: notificationReducer,
        chat: chatReducer,
        contact :contactReducer,

  },
});

export default store;
