// context/AppContextProvider.jsx
import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import notificationSound from "../utils/notification.wav";

import {
  addMessage,
  updateMessageStatus,
  getUnreadMessagesThunk,
  getAllConversationsThunk,
} from "../store/slices/chatSlice";

import { increment } from "../store/slices/notificationSlice";
import { refreshTokenThunk } from "../store/slices/authSlics";
import {
  setIsMobileDimention,
  setIsDesktopDimention,
} from "../store/slices/uiSlice";
import { getContactsThunk } from "../store/slices/contactsSlice";
import { updateUserStatus } from "../store/slices/presenceSlice";
import { startTyping, stopTyping } from "../store/slices/typingSlice";

import { openDB } from "idb";
import { normalizeIncoming } from "../utils/messageUtils";


/* ---------- IndexedDB for contacts ---------- */
const dbPromise = openDB("ContactsDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("contacts")) {
      db.createObjectStore("contacts", { keyPath: "id" });
    }
  },
});

export async function addContactToDB(contact) {
  const db = await dbPromise;
  await db.put("contacts", contact);
}
export async function getAllContactsFromDB() {
  const db = await dbPromise;
  return await db.getAll("contacts");
}
export async function updateContactInDB(contact) {
  const db = await dbPromise;
  await db.put("contacts", contact);
}
export async function deleteContactFromDB(contactId) {
  const db = await dbPromise;
  await db.delete("contacts", contactId);
}



const AppContextProvider = ({ children }) => {
  const BASE_ADDRESS= process.env.REACT_APP_BASE_ADDRESS || "localhost";

  const dispatch = useDispatch();
  const { userObject = {} } = useSelector((s) => s.auth || {});
  const stompClientRef = useRef(null); // chat
  const videoClientRef = useRef(null); // video
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(notificationSound) : null);
  const prevWidth = useRef(window.innerWidth);
  const reconnectTimeoutRef = useRef(null);
  const typingTimersRef = useRef({});
  const [isConnected, setIsConnected] = React.useState(false);

  /* ---------- Load contacts from IndexedDB ---------- */
  useEffect(() => {
    (async () => {
      try {
        await getAllContactsFromDB();
      } catch (e) {
        console.warn("Failed to read contacts DB on startup", e);
      }
    })();
  }, []);

  /* ---------- Chat socket ---------- */
  useEffect(() => {
    if (!userObject?.phoneNumber) return;

    const connectChat = () => {
      const sock = new SockJS(`http://${BASE_ADDRESS}:8080/ws/chat`);
      const client = over(sock);
      stompClientRef.current = client;
      const token = localStorage.getItem("token") || userObject.accessToken;

      client.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("✅ Connected to WebSocket (Chat)");
          setIsConnected(true);

          dispatch(getAllConversationsThunk(userObject.phoneNumber));
          dispatch(getUnreadMessagesThunk(userObject.phoneNumber));

          if (userObject.id) {
            dispatch(getContactsThunk(userObject.id))
              .then(async (res) => {
                try {
                  const contacts = Array.isArray(res.payload)
                    ? res.payload
                    : res?.payload?.data ?? [];
                  const db = await dbPromise;
                  const tx = db.transaction("contacts", "readwrite");
                  await tx.objectStore("contacts").clear();
                  for (const c of contacts) {
                    await tx.objectStore("contacts").put(c);
                  }
                  await tx.done;
                } catch (err) {
                  console.warn("Failed to persist contacts to IDB", err);
                }
              })
              .catch((err) => console.warn("getContacts failed", err));
          }

          // messages
          client.subscribe("/topic/messages", (msg) => {
            try {
              const received = JSON.parse(msg.body);
              handleIncoming(normalizeIncoming(received));
            } catch (err) {
              console.warn("Failed parse /topic/messages", err);
            }
          });

          // private messages
          client.subscribe("/user/queue/message", (privateMsg) => {
            try {
              const received = JSON.parse(privateMsg.body);
              const statusUpdate = {
                id: received.id,
                senderPhone: received.senderPhone,
                receiverPhone: received.receiverPhone,
                status: "delivered",
              };
              stompClientRef.current.send("/app/updateStatus", {}, JSON.stringify(statusUpdate));
              handleIncoming(normalizeIncoming(received));
            } catch (err) {
              console.warn("Failed parse /user/queue/message", err);
            }
          });

          // message status
          client.subscribe("/user/queue/status", (statusMsg) => {
            try {
              const statusUpdate = JSON.parse(statusMsg.body);
              const contactPhone =
                statusUpdate.senderPhone === userObject.phoneNumber
                  ? statusUpdate.receiverPhone
                  : statusUpdate.senderPhone;

              dispatch(
                updateMessageStatus({
                  messageId: statusUpdate.id,
                  status: statusUpdate.status,
                  contactPhone,
                })
              );
            } catch (err) {
              console.warn("Failed parse /user/queue/status", err);
            }
          });

          // presence
          client.subscribe("/topic/presence", (presenceMsg) => {
            try {
              const presenceUpdate = JSON.parse(presenceMsg.body);
              if (presenceUpdate.lastSeen && typeof presenceUpdate.lastSeen === "object") {
                presenceUpdate.lastSeen = new Date(
                  presenceUpdate.lastSeen.seconds * 1000 +
                    presenceUpdate.lastSeen.nanos / 1000000
                ).toISOString();
              }
              dispatch(updateUserStatus(presenceUpdate));
            } catch (err) {
              console.warn("Failed parse /topic/presence", err);
            }
          });

          // typing
          client.subscribe("/user/queue/typing", (typingMsg) => {
            try {
              const typingEvent = JSON.parse(typingMsg.body);
              const contactPhoneNumber = typingEvent.from;

              if (typingEvent.typing) {
                dispatch(startTyping({ contactPhoneNumber }));
                if (typingTimersRef.current[contactPhoneNumber]) {
                  clearTimeout(typingTimersRef.current[contactPhoneNumber]);
                }
                typingTimersRef.current[contactPhoneNumber] = setTimeout(() => {
                  dispatch(stopTyping({ contactPhoneNumber }));
                }, 3000);
              } else {
                if (typingTimersRef.current[contactPhoneNumber]) {
                  clearTimeout(typingTimersRef.current[contactPhoneNumber]);
                }
                dispatch(stopTyping({ contactPhoneNumber }));
              }
            } catch (err) {
              console.warn("Failed parse /user/queue/typing", err);
            }
          });
        },
        (error) => {
          console.error("❌ STOMP connect error", error);
          setIsConnected(false);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connectChat, 2000 + Math.random() * 3000);
        }
      );
    };

    connectChat();

    return () => {
      try {
        if (stompClientRef.current?.connected) {
          stompClientRef.current.disconnect(() => {
            console.log("🔌 Chat disconnected");
            setIsConnected(false);
          });
        }
      } catch {}
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      Object.values(typingTimersRef.current).forEach(clearTimeout);
    };
  }, [userObject, dispatch]);

  /* ---------- Video socket ---------- */

  useEffect(() => {
    if (!userObject?.phoneNumber) return;

    const sockVideo = new SockJS(`http://${BASE_ADDRESS}:8080/ws/video-call`);
    const clientVideo = over(sockVideo);
    videoClientRef.current = clientVideo;

    const token = localStorage.getItem("token") || userObject.accessToken;
    clientVideo.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("✅ Connected to WebSocket (Video)");
      },
      (err) => console.error("Video socket error", err)
    );

    return () => {
      if (videoClientRef.current?.connected) {
        videoClientRef.current.disconnect();
        console.log("🔌 Video disconnected");
      }
    };
  }, [userObject]);

  /* ---------- Incoming message handler ---------- */
  const handleIncoming = (msg) => {
    const payload = { ...msg, myPhone: userObject.phoneNumber };
    dispatch(addMessage(payload));

    if (!document.hasFocus() && msg.from !== userObject.phoneNumber) {
      try {
        audioRef.current && audioRef.current.play().catch(() => {});
      } catch {}
      dispatch(increment());
    }
  };

  /* ---------- Token refresh ---------- */
  useEffect(() => {
    dispatch(refreshTokenThunk());
    const tokenInterval = setInterval(() => {
      dispatch(refreshTokenThunk());
    }, 9 * 60 * 1000);
    return () => clearInterval(tokenInterval);
  }, [dispatch]);

  /* ---------- Layout detection ---------- */
  useLayoutEffect(() => {
    const width = window.innerWidth;
    if (width < 950) dispatch(setIsMobileDimention(true));
    else dispatch(setIsDesktopDimention(true));
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasMobile = prevWidth.current < 950;
      const isNowMobile = currentWidth < 950;
      if (wasMobile !== isNowMobile) {
        if (isNowMobile) dispatch(setIsMobileDimention(true));
        else dispatch(setIsDesktopDimention(true));
      }
      prevWidth.current = currentWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  /* ---------- Initial conversation sync ---------- */
  useEffect(() => {
    if (!userObject?.phoneNumber) return;
    dispatch(getUnreadMessagesThunk(userObject.phoneNumber));
    dispatch(getAllConversationsThunk(userObject.phoneNumber));
  }, [userObject?.phoneNumber, dispatch]);

  return (
    <AppContext.Provider
      value={{ stompClient: stompClientRef, videoClient: videoClientRef, isConnected ,handleIncoming,typingTimersRef}}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
