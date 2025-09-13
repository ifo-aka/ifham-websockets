import { useState } from "react";
import PageLayout from "../components/PageLayout";
import styles from "../assets/ChatPage.module.css";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Welcome to the chat! 🚀" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: "me",
      text: newMessage,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <PageLayout>
      <div className={styles.chatContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3>Chats</h3>
          <ul>
            <li className={styles.activeChat}>General</li>
            <li>Support</li>
            <li>Friends</li>
          </ul>
        </aside>

        {/* Main Chat Area */}
        <section className={styles.chatArea}>
          {/* Chat Header */}
          <header className={styles.chatHeader}>
            <h2>General Chat</h2>
            <span className={styles.status}>● Online</span>
          </header>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.sender === "me" ? styles.myMessage : styles.botMessage
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">➤</button>
          </form>
        </section>
      </div>
    </PageLayout>
  );
};

export default ChatPage;
