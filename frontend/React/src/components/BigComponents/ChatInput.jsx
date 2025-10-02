import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../../assets/ChatPage.module.css";
import { useState } from "react";
// ---------- Chat Input ----------
function ChatInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
    setShowPicker(false);
  };

  return (
    <div className={styles.chatInputWrapper}>
      {showPicker && (
        <div className={styles.pickerContainer}>
          <Picker data={data} onEmojiSelect={(emoji) => setText((prev) => prev + emoji.native)} />
        </div>
      )}
      <form className={styles.chatInput} onSubmit={submit}>
        <button
          type="button"
          className={styles.emojiButton}
          onClick={() => setShowPicker((val) => !val)}
        >
          😊
        </button>
        <input
          value={text}
          onInput={onTyping}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">➤</button>
      </form>
    </div>
  );
}
export default ChatInput;