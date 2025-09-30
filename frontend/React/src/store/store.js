import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlics";
import notificationReducer from "./slices/notificationSlice";
import chatReducer from "./slices/chatSlice"; 
import contactReducer from "./slices/contactsSlice";
import presenceReducer from "./slices/presenceSlice";
import typingReducer from "./slices/typingSlice";
import videoCallReducer from "./slices/videoCallSlice";

export const store = configureStore({
  reducer: {
    // auth: authReducer,
       ui : uiReducer,
       auth: authReducer,
        notification: notificationReducer,
        chat: chatReducer,
        contact :contactReducer,
        presence: presenceReducer,
        typing: typingReducer,
        videoCall: videoCallReducer,

  },
});

export default store;
