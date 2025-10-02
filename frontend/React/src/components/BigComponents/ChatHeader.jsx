import imgPlaceholder from "../../assets/imges/user-placeholder.png";
import styles from "../../assets/ChatPage.module.css";
import { FaVideo } from "react-icons/fa";
const BASE_ADDRESS = process.env.REACT_APP_BASE_ADDRESS || "localhost";
const API_BASE_URL = `http://${BASE_ADDRESS}:8080`; 
// ---------- Chat Header ----------
function ChatHeader({ contact, subtitle = "online", onVideoCall }) {
  const contactProfilePic = contact?.profilePictureUrl
    ? `${API_BASE_URL}${contact.profilePictureUrl}`
    : imgPlaceholder;

  return (
    <div className={styles.chatHeader}>
      <div className={styles.headerLeft}>
        <img src={contactProfilePic} alt="dp" className={styles.avatarSmall} />
        <div>
          <div className={styles.headerTitle}>{contact?.savedAs || "Contact"}</div>
          <div className={`${styles.headerSub} ${subtitle === "typing..." ? styles.typing : ""}`}>
            {subtitle}
          </div>
        </div>
      </div>
      <div className={styles.headerRight}>
        <FaVideo onClick={onVideoCall} />
     
      </div>
    </div>
  );
}

export default ChatHeader;

