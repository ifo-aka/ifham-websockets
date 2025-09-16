import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { AppContext } from "./AppContext";
import notificationSound from "../utils/notification.wav";
import { addMessage } from "../store/slices/chatSlice";
import { increment } from "../store/slices/notificationSlice";

import {refreshTokenThunk} from "../store/slices/authSlics"

const AppContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const stompClientRef = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));

  useEffect(() => {
    // 🟢 WebSocket + STOMP setup
    const socket = new SockJS("http://localhost:8080/ws/chat");
    const client = over(socket);
    stompClientRef.current = client;

    client.connect({}, () => {
      console.log("✅ Connected to WebSocket");

      client.subscribe("/topic/messages", (msg) => {
        const received = JSON.parse(msg.body);

        // Save message in Redux
        dispatch(addMessage(received));

        // Play notification if window is not focused
        if (!document.hasFocus() && received.from !== "Bot") {
          audioRef.current.play().catch(() => {});
          dispatch(increment());
        }
      });
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => console.log("❌ WebSocket disconnected"));
      }
    };
  }, [dispatch]);


  useEffect(() => {
    dispatch(refreshTokenThunk());
  }, []);
  return (
    <AppContext.Provider value={{ stompClient: stompClientRef }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
