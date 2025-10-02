import { createContext } from "react";

export const AppContext = createContext({
  stompClient: null, // correctly spelled
  videoClient: null,
  isConnected: false,
  onChatConnect: null,
  onVideoConnect: null,
});
