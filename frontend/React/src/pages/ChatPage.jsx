import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  createRef,
  Fragment,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../store/slices/notificationSlice";
import { AppContext } from "../context/AppContext";
import Container from "../components/Container";
import Input from "../components/Input";
import { checkPhoneNumber } from "../utils/DBUtils";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import imgPlaceholder from "../assets/imges/user-placeholder.png";
import styles from "../assets/ChatPage.module.css";
import { addContactThunk } from "../store/slices/contactsSlice";
import { Form } from "react-router-dom";

/* helper: format time */
const formatTime = (isoOrDate) => {
  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const ChatPage = () => {
  const dispatch = useDispatch();
  const { stompClient } = useContext(AppContext);

  const { messages: allMessages = [] } = useSelector((s) => s.chat);
  const { contacts = [] } = useSelector((s) => s.contact);
  const { userObject = {} } = useSelector((s) => s.auth);

  const myName = userObject?.username || "You";
  const myPhone = userObject?.phoneNumber || "";

  // UI state
  const [activeSidebar, setActiveSidebar] = useState("General");
  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saveAs, setSaveAs] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneCheckResult, setPhoneCheckResult] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // scroll
  const messagesEndRef = useRef(null);
  console.log(useSelector(s=>s.chat))

  // Map of refs for CSSTransition nodeRef to avoid findDOMNode usage
  // Keep stable across re-renders
  const refsMap = useRef(new Map());

  // visible messages logic
  const visibleMessages = allMessages.filter((m) => {
    if (!activeContact || activeContact === "General") {
      return m.room === "general" || m.to === "general" || (!m.to && !m.room);
    }
    if (m.room && m.room === activeContact.roomId) return true;
    if (m.to && (m.to === activeContact.phoneNumber || m.to === myPhone)) return true;
    if (m.from && (m.from === activeContact.phoneNumber || m.from === myPhone)) return true;
    return false;
  });

  // auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  // reset notifications on focus
  useEffect(() => {
    const onFocus = () => dispatch(reset());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  // phone validation + existence check
  useEffect(() => {
    setPhoneError("");
    setPhoneCheckResult("");

    if (!phoneNumber) return;

    if (!/^\d*$/.test(phoneNumber)) {
      setPhoneError("Only digits allowed");
      return;
    }
    if (phoneNumber.length > 11) {
      setPhoneError("Too long (max 11)");
      return;
    }
    if (phoneNumber.length >= 3 && !phoneNumber.startsWith("034")) {
      setPhoneError("Must start with 034");
      return;
    }

    if (phoneNumber.length === 11) {
      setIsChecking(true);
      checkPhoneNumber(phoneNumber)
        .then((res) => setPhoneCheckResult(res?.message || "No response"))
        .catch(() => setPhoneCheckResult("Error checking number"))
        .finally(() => setIsChecking(false));
    }
  }, [phoneNumber]);

  // send message (STOMP)
  const handleSend = (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    if (!stompClient?.current) {
      console.warn("No stomp client connected");
      return;
    }

    const payload = {
      from: myName,
      fromPhone: myPhone,
      content: newMessage.trim(),
      time: new Date().toISOString(),
      to: activeContact && activeContact !== "General" ? activeContact.phoneNumber : "general",
      room: activeContact?.roomId || "1",
    };

    try {
      stompClient.current.send("/app/sendMessage", {}, JSON.stringify(payload));
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const startChatWith = (contact) => {
    setActiveSidebar("Chats");
    setActiveContact(contact);
  };

  const filteredContacts = contacts
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.savedAs || c.username || "").toLowerCase().includes(q) ||
        (c.phoneNumber || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.savedAs || a.username || "").localeCompare(b.savedAs || b.username || ""));
  const handleSaveContact = (e) => {
   e.preventDefault()
    console.log(userObject.id)
    dispatch(addContactThunk( {saveAs, phoneNumber ,id: userObject.id})).then((res)=>{
      console.log(res)
    })
  };

  return (
    <Container className={styles.containerRoot}>
      <div className={styles.chatContainer}>
        {/* Left Sidebar */}
        <aside className={styles.leftSidebar}>
          <div className={styles.leftHeader}>
            <div className={styles.leftTitle}>Chats</div>
            <button
              className={styles.iconBtn}
              onClick={() => setShowAddModal(true)}
              title="New contact"
            >
              ➕
            </button>
          </div>

          <div className={styles.sidebarMenu}>
            {["General", "All", "Friends", "Work", "Support", "Settings"].map((item) => (
              <div
                key={item}
                className={`${styles.menuItem} ${activeSidebar === item ? styles.activeMenuItem : ""}`}
                onClick={() => {
                  setActiveSidebar(item);
                  setActiveContact(item === "General" ? "General" : null);
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div className={styles.recentChats}>
            <div className={styles.recentTitle}>Recent</div>
            {contacts.slice(0, 6).map((c, idx) => (
              <div
                key={(c.phoneNumber || "") + idx}
                className={`${styles.recentItem} ${activeContact?.phoneNumber === c.phoneNumber ? styles.recentActive : ""}`}
                onClick={() => startChatWith(c)}
              >
                <img src={ imgPlaceholder} alt={c.savedAs} className={styles.recentAvatar} />
                <div className={styles.recentMeta}>
                  <div className={styles.recentName}>{c.savedAs || c.username || "Unknown"}</div>
                  <div className={styles.recentSnippet}>{c.lastMessage?.slice(0, 28) || "Say hi!"}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Middle Chat Area */}
        <main className={styles.chatArea}>
          <header className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              {activeContact && activeContact !== "General" ? (
                <Fragment>
                  <img src={ imgPlaceholder} alt="avatar" className={styles.headerAvatar} />
                  <div>
                    <div className={styles.headerTitle}>{activeContact.savedAs || activeContact.username}</div>
                    <div className={styles.headerSub}>{activeContact.phoneNumber}</div>
                  </div>
                </Fragment>
              ) : (
                <div>
                  <div className={styles.headerTitle}>General Chat</div>
                  <div className={styles.headerSub}>Public room · Be kind ✨</div>
                </div>
              )}
            </div>

            <div className={styles.chatHeaderRight}>
              <div className={styles.headerSmall}>{myName}</div>
              <div className={styles.headerSmallMuted}>{myPhone}</div>
            </div>
          </header>

          {/* Messages area */}
          <div className={styles.messagesWrap}>
            {(!activeContact || activeContact === "General") && visibleMessages.length === 0 ? (
              <div className={styles.welcomeCard}>
                <h2>Welcome to WhatsApp Clone</h2>
                <p>Select a contact to start messaging. Use the + button to add contacts.</p>
              </div>
            ) : (
              <TransitionGroup className={styles.messagesList}>
                {visibleMessages.map((m, i) => {
                  // stable key for message; prefer server-provided id, otherwise fallback to time+index
                  const msgKey = String(m.id ?? `${m.time ?? Date.now()}-${i}`);

                  // Ensure a ref exists for this message key
                  if (!refsMap.current.has(msgKey)) {
                    refsMap.current.set(msgKey, createRef());
                  }
                  const nodeRef = refsMap.current.get(msgKey);

                  const mine = m.from === myName || m.fromPhone === myPhone;

                  return (
                    <CSSTransition
                      key={msgKey}
                      nodeRef={nodeRef}
                      timeout={240}
                      classNames="msg"
                      unmountOnExit
                    >
                      <div
                        ref={nodeRef}
                        className={`${styles.message} ${mine ? styles.myMessage : styles.theirMessage}`}
                        aria-live="polite"
                      >
                        <div className={styles.messageTop}>
                          <span className={styles.msgFrom}>{mine ? "You" : m.from}</span>
                          <span className={styles.msgTime}>{formatTime(m.time)}</span>
                        </div>
                        <div className={styles.msgContent}>{m.content}</div>
                      </div>
                    </CSSTransition>
                  );
                })}
                <div ref={messagesEndRef} />
              </TransitionGroup>
            )}
          </div>

          {/* Input */}
          <form className={styles.inputArea} onSubmit={handleSend}>
            <input
              type="text"
              placeholder={
                activeContact && activeContact !== "General"
                  ? `Message ${activeContact.savedAs || activeContact.username}`
                  : "Message the group"
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendBtn} disabled={!stompClient?.current}>
              ➤
            </button>
          </form>
        </main>

        {/* Right Sidebar: Contacts */}
        <aside className={styles.rightSidebar}>
          <div className={styles.contactsHeader}>
            <div className={styles.contactsTitle}>Contacts</div>
            <button className={styles.iconBtn} onClick={() => setShowAddModal(true)}>＋</button>
          </div>

          <div className={styles.contactsSearch}>
            <Input
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              name="contactSearch"
            />
          </div>

          <div className={styles.contactsList}>
            {filteredContacts.length === 0 && <div className={styles.emptyContacts}>No contacts found</div>}
            {filteredContacts.map((c, index) => (
              <div
                key={(c.phoneNumber || "") + index}
                className={`${styles.contactCard} ${activeContact?.phoneNumber === c.phoneNumber ? styles.contactActive : ""}`}
                onClick={() => startChatWith(c)}
              >
                <img src={imgPlaceholder} alt={c.savedAs} className={styles.contactAvatar} />
                <div className={styles.contactMeta}>
                  <div className={styles.contactName}>{c.savedAs || c.username}</div>
                  <div className={styles.contactPhone}>{c.phoneNumber}</div>
                </div>
                <div className={styles.contactRight}>
                  <div className={styles.lastMsg}>{c.lastMessage?.slice(0, 28)}</div>
                  {c.unread > 0 && <div className={styles.unreadBadge}>{c.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} >
          <Form className={styles.modal} onSubmit={handleSaveContact}>
            <h3>Add Contact</h3>
            <div className={styles.modalBody}>
              <input
                type="text"
                placeholder="Save as (name)"
                value={saveAs}
                onChange={(e) => setSaveAs(e.target.value)}
                className={styles.modalInput}
              />
              <input
                type="text"
                placeholder="Phone (034xxxxxxxx)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={styles.modalInput}
                maxLength={11}
                inputMode="numeric"
              />
              {phoneError && <div className={styles.modalError}>{phoneError}</div>}
              {!phoneError && phoneCheckResult && (
                <div className={styles.modalInfo}>{isChecking ? "Checking..." : phoneCheckResult}</div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.addButton}
               
                type="submit"
          
                disabled={phoneCheckResult !== "User Available"}
              >
                Add
              </button>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>
                Close
              </button>
            </div>
          </Form>
        </div>
      )}
    </Container>
  );
};

export default ChatPage;
