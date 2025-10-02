import React from "react";
import { useSelector } from "react-redux";
import styles from "../../assets/ChatPage.module.css";
import imgPlaceholder from "../../assets/imges/user-placeholder.png";
import Input from "../Input";
import Button from "../Button";
import { formatTime } from "../../utils/HelpersDateUtil";
// ---------- Sidebar ----------
const BASE_ADDRESS = process.env.REACT_APP_BASE_ADDRESS || "localhost";
const API_BASE_URL =  `http://${BASE_ADDRESS}:8080`;
 function Sidebar({ onSelectChat, onAddClick, onProfileClick }) {
  const { contacts = [] } = useSelector((state) => state.contact || {});
  const { messagesByContact } = useSelector((state) => state.chat);
  const { userObject } = useSelector((state) => state.auth);

  const myProfilePic = userObject?.profilePictureUrl
    ? `${API_BASE_URL}${userObject.profilePictureUrl}`
    : imgPlaceholder;

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
        <img src={myProfilePic} alt="me" className={styles.avatarSmall} onClick={onProfileClick} />
        <div className={styles.sidebarActions}>
          <Button  onClick={onAddClick}>+</Button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <Input type="text" placeholder="Search or start new chat" />
      </div>

      <div className={styles.chatList}>
        {contacts.map((c) => {
          const contactProfilePic = c.profilePictureUrl
            ? `${API_BASE_URL}${c.profilePictureUrl}`
            : imgPlaceholder;
          return (
            <div key={c.phoneNumber} className={styles.chatListItem} onClick={() => onSelectChat(c)}>
              <img src={contactProfilePic} alt="dp" className={styles.avatarSmall} />
              <div className={styles.chatListText}>
                <div className={styles.chatListName}>{c.savedAs}</div>
                <div className={styles.chatListLast}>{getLastMessage(c.phoneNumber).text}</div>
              </div>
              <div className={styles.chatListTime}>{getLastMessage(c.phoneNumber).time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Sidebar;
