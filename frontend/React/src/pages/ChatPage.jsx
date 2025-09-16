import { useState, useEffect, useContext, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../store/slices/notificationSlice";
import { AppContext } from "../context/AppContext";
import Container from "../components/Container";
import styles from "../assets/ChatPage.module.css";
import { CSSTransition,TransitionGroup } from "react-transition-group";

const ChatPage = () => {
  const { messages } = useSelector((state) => state.chat);
  const { userObject } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const myName = userObject?.username || "Guest";
  const { stompClient } = useContext(AppContext);

  const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null); // ✅ ref for scrolling

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

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient.current) return;

    const date = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const chatMsg = { from: myName, content: newMessage, time: date };
    stompClient.current.send("/app/sendMessage", {}, JSON.stringify(chatMsg));
    setNewMessage("");
  };
  const handleMsgOnclick= (event)=>{
    event.preventDefault();
    console.log(event)
  
  }

  return (
    <Container>
      <div className={styles.chatContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2>Chats</h2>
          <ul>
            <li className={styles.activeChat}>General</li>
            <li>Support</li>
            <li>Friends</li>
            <li>Work</li>
            <li>Random</li>
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
            <p>{myName}</p>
          </header>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
                <CSSTransition key={i} timeout={200} classNames="slide">
                <div
                  className={`${styles.message} ${
                    msg.from === myName ? styles.myMessage : styles.botMessage
                  }`} onClick={handleMsgOnclick}
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
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" disabled={!stompClient.current}>
              ➤
            </button>
          </form>
        </section>
      </div>
    </Container>
  );
};

export default ChatPage;
