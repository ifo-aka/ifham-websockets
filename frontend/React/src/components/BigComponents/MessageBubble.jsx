
import { formatTime } from "../../utils/HelpersDateUtil";
import React from "react";
import styles from "../../assets/ChatPage.module.css";
import imgPlaceholder from "../../assets/imges/user-placeholder.png";
const BASE_ADDRESS = process.env.REACT_APP_BASE_ADDRESS || "localhost";
const API_BASE_URL = `http://${BASE_ADDRESS}}:8080`; 

// ---------- Message Bubble ----------
function MessageBubble({ m, isMine }) {
  const profilePicUrl = m.senderProfilePictureUrl
    ? `${API_BASE_URL}${m.senderProfilePictureUrl}`
    : imgPlaceholder;

  return (
    <div className={`${styles.messageRow} ${isMine ? styles.rowMine : styles.rowTheir}`}>
      {!isMine && (
        <img src={profilePicUrl} alt="sender" className={styles.avatarSmall} />
      )}
      <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheir}`}>
        <div>{m.content}</div>
        <div className={styles.bubbleMeta}>
          <span className={styles.time}>{formatTime(m.timestamp)}</span>
          {isMine && <span className={styles.ticks}>{m.status === "SEEN" ? "✅✅" : m.status==="dilivered"? "✔️✔️":"✔️"}</span>}
        </div>
      </div>
    </div>
  );
}
export default MessageBubble;
// Should be in an env variable

