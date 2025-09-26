/* ===================== ChatPage.jsx ===================== */
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "../assets/ChatPage.module.css";
import imgPlaceholder from "../assets/imges/user-placeholder.png";
import { AppContext } from "../context/AppContextProvider";

// ---------- Helpers ----------
const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const getRelativeDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Clear time part for accurate date comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }
  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString();
};

const formatLastSeen = (isoString) => {
  if (!isoString) return "Offline";
  const lastSeenDate = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const time = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Reset hours, minutes, seconds and milliseconds
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const lastSeenStart = new Date(lastSeenDate.getFullYear(), lastSeenDate.getMonth(), lastSeenDate.getDate());

  if (lastSeenStart.getTime() === todayStart.getTime()) {
    return `last seen today at ${time}`;
  }
  if (lastSeenStart.getTime() === yesterdayStart.getTime()) {
    return `last seen yesterday at ${time}`;
  }
  return `last seen on ${lastSeenDate.toLocaleDateString()}`;
};


// ---------- Sidebar ----------
function Sidebar({ onSelectChat }) {
  const { contacts = [] } = useSelector((state) => state.contact || {});
  const { messagesByContact } = useSelector((state) => state.chat);

  const getLastMessage = (contactId) => {
    const messages = messagesByContact[contactId];
    if (!messages || messages.length === 0) {
      return { text: "No messages yet", time: "" };
    }
    const lastMsg = messages[messages.length - 1];
    return {
      text: lastMsg.content,
      time: formatTime(lastMsg.timestamp),
    };
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <img src={imgPlaceholder} alt="me" className={styles.avatarSmall} />
        <div className={styles.sidebarActions}>⚙️</div>
      </div>
      <div className={styles.searchBar}>
        <input type="text" placeholder="Search or start new chat" />
      </div>
      <div className={styles.chatList}>
        {contacts.map((c) => (
          <div key={c.id} className={styles.chatListItem} onClick={() => onSelectChat(c)}>
            <img src={imgPlaceholder} alt="dp" className={styles.avatarSmall} />
            <div className={styles.chatListText}>
              <div className={styles.chatListName}>{c.savedAs}</div>
              <div className={styles.chatListLast}>{getLastMessage(c.phoneNumber).text}</div>
            </div>
            <div className={styles.chatListTime}>{getLastMessage(c.phoneNumber).time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Chat Panel ----------
function ChatHeader({ title = "Contact", subtitle = "online" }) {
  return (
    <div className={styles.chatHeader}>
      <div className={styles.headerLeft}>
        <img src={imgPlaceholder} alt="dp" className={styles.avatarSmall} />
        <div>
          <div className={styles.headerTitle}>{title}</div>
          <div className={styles.headerSub}>{subtitle}</div>
        </div>
      </div>
      <div className={styles.headerRight}>📞 ⋮</div>
    </div>
  );
}

function MessageBubble({ m, isMine }) {
  return (
    <div className={`${styles.messageRow} ${isMine ? styles.rowMine : ""}`}>
      <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheir}`}>
        <div>{m.content}</div>
        <div className={styles.bubbleMeta}>
          <span className={styles.time}>{formatTime(m.timestamp)}</span>
          {isMine && <span className={styles.ticks}>{m.status === "SEEN" ? "✅✅" : "✅"}</span>}
        </div>
      </div>
    </div>
  );
}

function ChatBody({ messages, myPhoneNumber }) {
  const endRef = useRef(null);

  const groupedMessages = useMemo(() => {
    if (!messages) return {};
    return messages.reduce((acc, m) => {
      const dateStr = getRelativeDate(m.timestamp);
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(m);
      return acc;
    }, {});
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatBody}>
      {Object.keys(groupedMessages).map(date => (
        <React.Fragment key={date}>
          <div className={styles.dateDivider}>
            <span className={styles.dateDividerSpan}>{date}</span>
          </div>
          {groupedMessages[date].map(m => (
            <MessageBubble key={m.id} m={m} isMine={m.senderPhone === myPhoneNumber} />
          ))}
        </React.Fragment>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <form className={styles.chatInput} onSubmit={submit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
      <button type="submit">➤</button>
    </form>
  );
}

// ---------- Main Page ----------
export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const { stompClient } = useContext(AppContext);

  const { userObject } = useSelector((state) => state.auth);
  const { messagesByContact } = useSelector((state) => state.chat);
  const { userStatus } = useSelector((state) => state.presence);

  const messages = activeChat ? messagesByContact[activeChat.phoneNumber] || [] : [];

  useEffect(() => {
    if (!messages || !stompClient.current || !activeChat) return;

    messages.forEach(message => {
      if (message.senderPhone === activeChat.phoneNumber && message.status !== 'SEEN') {
        const statusUpdate = {
          id: message.id,
          senderPhone: message.senderPhone,
          receiverPhone: message.receiverPhone,
          status: 'SEEN'
        };
        stompClient.current.send("/app/updateStatus", {}, JSON.stringify(statusUpdate));
      }
    });

  }, [messages, activeChat, stompClient]);

  const handleSend = (text) => {
    if (!stompClient.current || !activeChat) return;

    const message = {
      from: userObject.phoneNumber,
      to: activeChat.phoneNumber,
      content: text,
    };

    stompClient.current.send("/app/private-message", {}, JSON.stringify(message));
  };

  let subtitle = "Offline";
  if (activeChat) {
    const contactPresence = userStatus[activeChat.phoneNumber];
    if (contactPresence?.status === "ONLINE") {
      subtitle = "Online";
    } else if (contactPresence?.lastSeen) {
      subtitle = formatLastSeen(contactPresence.lastSeen);
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar onSelectChat={setActiveChat} />
      <div className={styles.chatPanel}>
        {activeChat ? (
          <>
            <ChatHeader title={activeChat.savedAs} subtitle={subtitle} />
            <ChatBody messages={messages} myPhoneNumber={userObject.phoneNumber} />
            <ChatInput onSend={handleSend} />
          </>
        ) : (
          <div className={styles.emptyState}>Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}