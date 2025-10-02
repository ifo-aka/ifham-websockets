
import React, { useMemo, useRef,useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "../../assets/ChatPage.module.css";
import MessageBubble from "./MessageBubble";
import { getRelativeDate } from "../../utils/HelpersDateUtil";
// ---------- Chat Body ----------
function ChatBody({ messages, myPhoneNumber }) {
  const endRef = useRef(null);

  const groupedMessages = useMemo(() => {
    if (!messages) return {};
    return messages.reduce((acc, m) => {
      const dateStr = getRelativeDate(m.timestamp);
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(m);
      return acc;
    }, {});
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatBody}>
      {Object.keys(groupedMessages).map((date) => (
        <React.Fragment key={date}>
          <div className={styles.dateDivider}>
            <span className={styles.dateDividerSpan}>{date}</span>
          </div>
          {groupedMessages[date].map((m) => (
            <MessageBubble key={m.id} m={m} isMine={m.senderPhone === myPhoneNumber} />
          ))}
        </React.Fragment>
      ))}
      <div ref={endRef} />
    </div>
  );
}
export default ChatBody;

