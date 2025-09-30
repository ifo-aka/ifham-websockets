/* ===================== ChatPage.jsx ===================== */
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../assets/ChatPage.module.css";
import imgPlaceholder from "../assets/imges/user-placeholder.png";
import { AppContext } from "../context/AppContextProvider";
import Button from "../components/Button";
import Input from "../components/Input";
import { FaTimes, FaVideo } from "react-icons/fa";
import { addContactThunk, isContactAvailibleThunk } from "../store/slices/contactsSlice";
import ProfileModal from "../components/ProfileModal";
import { updateUserProfileThunk } from "../store/slices/authSlics";
import WebRTCService from "../services/webrtcService";
import { setInCall, setIsReceivingCall, setCaller, setOffer, setLocalStream, setRemoteStream } from "../store/slices/videoCallSlice";

const API_BASE_URL = 'http://localhost:8080';

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

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString();
};

const formatLastSeen = (isoString) => {
  if (!isoString) return "Offline";
  const lastSeenDate = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const time = lastSeenDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <div key={c.id} className={styles.chatListItem} onClick={() => onSelectChat(c)}>
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

// ---------- Add Contact Modal ----------
function AddContactModal({ isOpen, onClose }) {
    const { userObject } = useSelector((state) => state.auth);
    const id= userObject.id;
  const dispatch=useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMessage, setShowMessage] = useState("");
  const [savedAs, setSavedAs] = useState("");
  const handleSaveAsChange=(e)=>{
    e.preventDefault();
    setSavedAs(e.target.value);

  }

  const handleChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("034")) val = "034"; // force prefix
    val = val.slice(0, 11); // max 11 digits
    val = val.replace(/\D/g, ""); // only numbers
    setPhoneNumber(val);
    if(val.length<11){
      setShowMessage("");
    }
  
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length === 11) {
      setShowMessage(`Adding contact: ${phoneNumber}`);
      const contact = {
        phoneNumber,
        savedAs: savedAs || "New Contact",
        id,
      };  
   
      dispatch(addContactThunk(contact)).then((res) => {
        console.log('Response from addContactThunk:', res);
        if (res.payload && res.payload.message) {
          setShowMessage(res.payload.message);
          if (res.payload.success) {
            setSavedAs("");
            setPhoneNumber("");
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        } else if (res.error && res.error.message) {
          setShowMessage(res.error.message);
        } else {
          setShowMessage('An unexpected error occurred.');
        }
      });
    }
  };
  useEffect(() => {
    if (phoneNumber.length === 11) {
      dispatch(isContactAvailibleThunk(phoneNumber)).then((res) => {
        console.log('Response from isContactAvailibleThunk:', res);
        if (res.payload && res.payload.message) {
          setShowMessage(res.payload.message);
        } else if (res.error && res.error.message) {
          setShowMessage(res.error.message);
        } else {
          setShowMessage('An unexpected error occurred.');
        }
      });
    }
  }, [phoneNumber]);


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Contact</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <Input label="Save As" type="text" placeholder="Enter contact name"  onChange={handleSaveAsChange} value={savedAs}/>
          <Input
            label="Phone Number"
            type="text"
            value={phoneNumber}
            onChange={handleChange}
            placeholder="034xxxxxxxx"
          />
          {showMessage && <p className={`${showMessage ==="User Available"?styles.success:styles.error}`}>{showMessage}</p>}
          <button type="submit" disabled={ showMessage !== "User Available" } className={styles.modalButton}>Add</button>
        </form>
        {/* will use react icon used */}
        <button className={styles.closeModal} onClick={onClose}><FaTimes /></button>
      </div>
    </div>
  );
}

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

// ---------- Main Page ----------
export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const { stompClient, isConnected } = useContext(AppContext);
  const dispatch = useDispatch();

  const { userObject } = useSelector((state) => state.auth);
  const { messagesByContact } = useSelector((state) => state.chat);
  const { userStatus } = useSelector((state) => state.presence);
  const { typingUsers } = useSelector((state) => state.typing);
  const { inCall, isReceivingCall, caller, offer, localStream, remoteStream } = useSelector((state) => state.videoCall);

  const myVideo = useRef();
  const userVideo = useRef();
  const webrtcService = useRef(null);

  const messages = activeChat ? messagesByContact[activeChat.phoneNumber] || [] : [];
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (stompClient.current && !webrtcService.current) {
      webrtcService.current = new WebRTCService(stompClient.current, dispatch, myVideo, userVideo);
    }
  }, [stompClient.current, dispatch, myVideo, userVideo]);

  const handleSaveProfile = (formData) => {
    dispatch(updateUserProfileThunk({ userId: userObject.id, formData })).then(
      (result) => {
        if (result.meta.requestStatus === "fulfilled") {
          setProfileModalOpen(false);
        } else {
          console.error("Failed to update profile:", result.payload);
        }
      }
    );
  };

  useEffect(() => {
    if (!messages || !stompClient.current || !activeChat) return;
    messages.forEach((message) => {
      if (message.senderPhone === activeChat.phoneNumber && message.status !== "SEEN") {
        const statusUpdate = {
          id: message.id,
          senderPhone: message.senderPhone,
          receiverPhone: message.receiverPhone,
          status: "SEEN",
        };
        stompClient.current.send("/app/updateStatus", {}, JSON.stringify(statusUpdate));
      }
    });
  }, [messages, activeChat, stompClient]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeChat]);

  useEffect(() => {
    if (!stompClient.current || !userObject || !isConnected) return;

    const callSubscription = stompClient.current.subscribe(`/user/${userObject.phoneNumber}/call`, (payload) => {
      const { from, signalData } = JSON.parse(payload.body);
      dispatch(setIsReceivingCall(true));
      dispatch(setCaller(from));
      dispatch(setOffer(signalData));
    });

    const acceptedSubscription = stompClient.current.subscribe(`/user/${userObject.phoneNumber}/call-accepted`, (payload) => {
      const { signal } = JSON.parse(payload.body);
      webrtcService.current.handleAnswer(signal);
    });

    const iceCandidateSubscription = stompClient.current.subscribe(`/user/${userObject.phoneNumber}/ice-candidate`, (payload) => {
        const { candidate } = JSON.parse(payload.body);
        webrtcService.current.handleIceCandidate(candidate);
    });

    return () => {
      callSubscription.unsubscribe();
      acceptedSubscription.unsubscribe();
      iceCandidateSubscription.unsubscribe();
    };
  }, [stompClient.current, userObject, isConnected, dispatch]);

  const callUser = (id) => {
    webrtcService.current.getLocalStream().then(stream => {
        webrtcService.current.initiateCall(id, stream, userObject);
    });
  };

  const answerCall = () => {
    dispatch(setIsReceivingCall(false));
    webrtcService.current.getLocalStream().then(stream => {
        webrtcService.current.handleOffer(offer, caller, stream);
    });
  };

  const leaveCall = () => {
    webrtcService.current.closeConnection();
  };

  useEffect(() => {
    if (localStream && myVideo.current) {
      myVideo.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  const handleSend = (text) => {
    if (!stompClient.current || !activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      const stopTypingEvent = {
        from: userObject.phoneNumber,
        to: activeChat.phoneNumber,
        typing: false,
      };
      stompClient.current.send("/app/typing", {}, JSON.stringify(stopTypingEvent));
    }

    const message = {
      from: userObject.phoneNumber,
      to: activeChat.phoneNumber,
      content: text,
    };

    stompClient.current.send("/app/private-message", {}, JSON.stringify(message));
  };

  const handleTyping = () => {
    if (!stompClient.current || !activeChat) return;

    if (!typingTimeoutRef.current) {
      const startTypingEvent = {
        from: userObject.phoneNumber,
        to: activeChat.phoneNumber,
        typing: true,
      };
      stompClient.current.send("/app/typing", {}, JSON.stringify(startTypingEvent));
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      const stopTypingEvent = {
        from: userObject.phoneNumber,
        to: activeChat.phoneNumber,
        typing: false,
      };
      stompClient.current.send("/app/typing", {}, JSON.stringify(stopTypingEvent));
      typingTimeoutRef.current = null;
    }, 2000);
  };

  let subtitle = "Offline";
  const contactIsTyping = activeChat && typingUsers[activeChat.phoneNumber];

  if (contactIsTyping) {
    subtitle = "typing...";
  } else if (activeChat) {
    const contactPresence = userStatus[activeChat.phoneNumber];
    if (contactPresence?.status === "ONLINE") {
      subtitle = "Online";
    } else if (contactPresence?.lastSeen) {
      subtitle = formatLastSeen(contactPresence.lastSeen);
    }
  }

  return (
    <>
      {(modalOpen || isProfileModalOpen) && <div className={styles.appBlur} />}
      <div className={styles.app}>
        <Sidebar onSelectChat={setActiveChat} onAddClick={() => setModalOpen(true)} onProfileClick={() => setProfileModalOpen(true)} />
        <div className={styles.chatPanel}>
          {activeChat ? (
            <>
              <ChatHeader contact={activeChat} subtitle={subtitle} onVideoCall={() => callUser(activeChat.phoneNumber)} />
              <ChatBody messages={messages} myPhoneNumber={userObject.phoneNumber} />
              <ChatInput onSend={handleSend} onTyping={handleTyping} />
            </>
          ) : (
            <div className={styles.emptyState}>Select a chat to start messaging</div>
          )}
        </div>
        <AddContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        {isProfileModalOpen && (
          <ProfileModal
            user={userObject}
            onClose={() => setProfileModalOpen(false)}
            onSave={handleSaveProfile}
          />
        )}
        {inCall && (
            <div className={styles.videoContainer}>
                <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
                <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
                <Button onClick={leaveCall}>End Call</Button>
            </div>
        )}
        {isReceivingCall && (
          <div className={styles.caller}>
            <h1>{caller} is calling...</h1>
            <Button onClick={answerCall}>Answer</Button>
          </div>
        )}
      </div>
    </>
  );
}
