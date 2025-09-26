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

import { openDB } from "idb";
import { normalizeIncoming } from "../utils/messageUtils";

/* ---------- IndexedDB for contacts (same as you had) ---------- */
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

/* ---------- AppContext ---------- */
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { userObject = {} } = useSelector((s) => s.auth || {});
  const stompClientRef = useRef(null);
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(notificationSound) : null);
  const prevWidth = useRef(window.innerWidth);
  const reconnectTimeoutRef = useRef(null);

  // load contacts from IndexedDB on startup (no-op if none)
  useEffect(() => {
    (async () => {
      try {
        const contacts = await getAllContactsFromDB();
        // you can decide to hydrate redux contacts here if you want;
        // we kept it minimal since you also fetch contacts from server below.
      } catch (e) {
        console.warn("Failed to read contacts DB on startup", e);
      }
    })();
  }, []);

  // connect + subscriptions
  useEffect(() => {
    if (!userObject?.phoneNumber) return;

    const connect = () => {
      const sock = new SockJS("http://localhost:8080/ws/chat");
      const client = over(sock);

      // keep ref for send/disconnect from other places
      stompClientRef.current = client;

      const token = localStorage.getItem("token") || userObject.accessToken;

      client.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("✅ Connected to WebSocket (STOMP)");

          // on connect: initial sync
          dispatch(getAllConversationsThunk(userObject.phoneNumber));
          dispatch(getUnreadMessagesThunk(userObject.phoneNumber));

          // fetch contacts and save to IndexedDB for offline
          if (userObject.id) {
            dispatch(getContactsThunk(userObject.id))
              .then(async (res) => {
                try {
                  if (res?.payload?.success || Array.isArray(res.payload)) {
                    const contacts = Array.isArray(res.payload)
                      ? res.payload
                      : res.payload.data ?? [];
                    // clear and write contacts to IDB
                    const db = await dbPromise;
                    const tx = db.transaction("contacts", "readwrite");
                    await tx.objectStore("contacts").clear();
                    for (const c of contacts) {
                      await tx.objectStore("contacts").put(c);
                    }
                    await tx.done;
                  }
                } catch (err) {
                  console.warn("Failed to persist contacts to IDB", err);
                }
              })
              .catch((err) => console.warn("getContacts failed", err));
          }

          // subscription: public/broadcast channel
          try {
            client.subscribe("/topic/messages", (msg) => {
              try {
                const received = JSON.parse(msg.body);
                const normalized = normalizeIncoming(received);
                handleIncoming(normalized);
              } catch (err) {
                console.warn("Failed parse /topic/messages", err);
              }
            });
          } catch (e) {
            console.warn("subscribe /topic/messages error", e);
          }

          // subscription: private messages to this user
          try {
            client.subscribe("/user/queue/message", (privateMsg) => {
              try {
                const received = JSON.parse(privateMsg.body);
                const normalized = normalizeIncoming(received);
                handleIncoming(normalized);
              } catch (err) {
                console.warn("Failed parse /user/queue/message", err);
              }
            });
          } catch (e) {
            console.warn("subscribe /user/queue/message error", e);
          }

          // subscription: status updates (READ / DELIVERED)
          try {
            client.subscribe("/user/queue/status", (statusMsg) => {
              try {
                const statusUpdate = JSON.parse(statusMsg.body);
                // normalize and dispatch status update to slice
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
          } catch (e) {
            console.warn("subscribe /user/queue/status error", e);
          }

          // subscription: presence updates
          try {
            client.subscribe("/topic/presence", (presenceMsg) => {
              try {
                const presenceUpdate = JSON.parse(presenceMsg.body);
                // Normalize the lastSeen timestamp
                if (presenceUpdate.lastSeen && typeof presenceUpdate.lastSeen === 'object') {
                    presenceUpdate.lastSeen = new Date(presenceUpdate.lastSeen.seconds * 1000 + presenceUpdate.lastSeen.nanos / 1000000).toISOString();
                }
                dispatch(updateUserStatus(presenceUpdate));
              } catch (err) {
                console.warn("Failed to parse /topic/presence", err);
              }
            });
          } catch (e) {
            console.warn("subscribe /topic/presence error", e);
          }
        },
        (error) => {
          console.error("❌ STOMP connect error", error);
          // try reconnect with backoff (avoid flooding)
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => connect(), 2000 + Math.random() * 3000);
        }
      );
    }; // end connect()

    connect();

    return () => {
      // cleanup: disconnect stomp client and clear reconnect timers
      try {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.disconnect(() => {
            console.log("🔌 STOMP disconnected (cleanup)");
          });
        }
      } catch (e) {
        console.warn("Error while disconnecting STOMP", e);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userObject, dispatch]);

  // handle incoming message (play sound + increment notifications)
  const handleIncoming = (msg) => {
    // dispatch normalized msg to redux
    const payload = { ...msg, myPhone: userObject.phoneNumber };
    dispatch(addMessage(payload));

    // play notification if window not focused and message not from me
    if (!document.hasFocus() && msg.from !== userObject.phoneNumber) {
      try {
        audioRef.current && audioRef.current.play().catch(() => {});
      } catch (e) {}
      dispatch(increment());
    }
  };

  // token refresh loop (run at mount and then every 9 minutes)
  useEffect(() => {
    // run once
    dispatch(refreshTokenThunk());

    const tokenInterval = setInterval(() => {
      dispatch(refreshTokenThunk());
    }, 9 * 60 * 1000);

    return () => clearInterval(tokenInterval);
  }, [dispatch]);

  // initial layout detection
  useLayoutEffect(() => {
    const width = window.innerWidth;
    if (width < 950) {
      dispatch(setIsMobileDimention(true));
    } else {
      dispatch(setIsDesktopDimention(true));
    }
  }, [dispatch]);

  // resize handler with debounce-ish behavior
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

  // On mounting, load unread + all conversations if phone is available
  useEffect(() => {
    if (!userObject?.phoneNumber) return;

    dispatch(getUnreadMessagesThunk(userObject.phoneNumber));
    dispatch(getAllConversationsThunk(userObject.phoneNumber));
    
  }, [userObject?.phoneNumber, dispatch]);

  return (
    <AppContext.Provider value={{ stompClient: stompClientRef }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;