import { useState, useEffect, useContext, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../store/slices/notificationSlice";
import { AppContext } from "../context/AppContext";
import Container from "../components/Container";
import styles from "../assets/ChatPage.module.css";
import { checkPhoneNumber } from "../utils/DBUtils";

import { CSSTransition } from "react-transition-group";

const ChatPage = () => {
  const { messages } = useSelector((state) => state.chat);
  const { userObject } = useSelector((state) => state.auth);
  const { contacts } = useSelector((s) => s.contact);
  const dispatch = useDispatch();
  const myName = userObject?.username || "Guest";
  const { stompClient } = useContext(AppContext);

  const [newMessage, setNewMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [savedAs, setSavedAs] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userphoneNumberExist, setUserPhoneNumberExist] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset notifications when chat is focused
  useEffect(() => {
    const handleFocus = () => dispatch(reset());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [dispatch]);

  // API Call when phone number is 11 digits
  useEffect(() => {
    if (phoneNumber.length === 11) {
      if (/^034\d{8}$/.test(phoneNumber)) {
        checkPhoneNumber(phoneNumber)
          .then((data) => setUserPhoneNumberExist(data.message))
          .catch((err) => console.error("❌ Error:", err));
      } else {
        alert("Phone number must start with 034 and be 11 digits!");
      }
    } else {
      setUserPhoneNumberExist("");
    }
  }, [phoneNumber]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient.current) return;

    const date = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const chatMsg = { from: myName, content: newMessage, time: date };
    stompClient.current.send("/app/sendMessage", {}, JSON.stringify(chatMsg));
    setNewMessage("");
  };

  return (
    <Container>
      <div className={`${styles.chatContainer} ${showForm ? styles.blurred : ""}`}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <header className={styles.sidebarHeader}>Chats</header>
          <ul>
            <li className={styles.activeChat}>General</li>
            <li onClick={() => setShowForm(true)}>+ Add Contact</li>
            <li>Friends</li>
            <li>Work</li>
            <li>Support</li>
            <li>Settings</li>
          </ul>
        </aside>

        {/* Main Chat Area */}
        <section className={styles.chatArea}>
          <header className={styles.chatHeader}>
            <div>
              <h2>General Chat</h2>
              <span className={styles.status}>● Online</span>
            </div>
            <div className={styles.userInfo}>
              <p>{myName}</p>
              <p>{userObject.phoneNumber}</p>
            </div>
          </header>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <CSSTransition key={i} timeout={200} classNames="slide">
                <div
                  className={`${styles.message} ${
                    msg.from === myName ? styles.myMessage : styles.botMessage
                  }`}
                >
                  <span className={styles.messageSender}>{msg.from}</span>
                  <span className={styles.messageContent}>{msg.content}</span>
                  <span className={styles.messageTime}>{msg.time}</span>
                </div>
              </CSSTransition>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" disabled={!stompClient.current}>
              ➤
            </button>
          </form>
        </section>

        {/* Contacts Sidebar */}
        <aside className={styles.contactSideBar}>
          <header className={styles.sidebarHeader}>Contacts</header>
          <div className={styles.contactContainer}>
            {contacts.map((contact, index) => (
              <div key={index} className={styles.contactCard}>
                <h6>{contact.savedAs}</h6>
                <p>{contact.phoneNumber}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Add Contact</h3>
            <form className={styles.contactForm} onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Save as..."
                value={savedAs}
                onChange={(e) => setSavedAs(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone (034xxxxxxxx)"
                value={phoneNumber}
                maxLength={11}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {userphoneNumberExist && (
                <p className={styles.phoneExistMessage}>{userphoneNumberExist}</p>
              )}
              <div className={styles.modalActions}>
                <button
                  className={styles.addButton}
                  disabled={userphoneNumberExist !== "User Available"}
                  type="submit"
                >
                  Add
                </button>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ChatPage;
