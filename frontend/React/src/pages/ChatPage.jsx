/* ===================== ChatPage.jsx ===================== */
import React, { useState, useEffect, useRef, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../assets/ChatPage.module.css";
import { AppContext } from "../context/AppContextProvider";
import Button from "../components/Button";
import { updateUserProfileThunk } from "../store/slices/authSlics";
import WebRTCService from "../services/webrtcService";
import { setInCall, setIsReceivingCall, setCaller, setOffer , setIsCalling} from "../store/slices/videoCallSlice";

const API_BASE_URL = 'http://localhost:8080';

// Importing components
import ChatHeader from "../components/BigComponents/ChatHeader";
import ChatBody from "../components/BigComponents/ChatBody";
import ChatInput from "../components/BigComponents/ChatInput";
import AddContactModal from "../components/BigComponents/AddContactModal";
import Sidebar from "../components/BigComponents/SideBar";
import ProfileModal from "../components/ProfileModal";

// helpers
import { formatLastSeen } from "../utils/HelpersDateUtil";

// ---------- Main Page ----------
export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [micOn, setMicOn] = useState(true);
const [camOn, setCamOn] = useState(true);

  const { stompClient, isConnected,videoClient } = useContext(AppContext);
  const dispatch = useDispatch();

  const { userObject } = useSelector((state) => state.auth);
  const { messagesByContact } = useSelector((state) => state.chat);
  const { userStatus } = useSelector((state) => state.presence);
  const { typingUsers } = useSelector((state) => state.typing);
  const { inCall, isReceivingCall, caller, offer,isCalling ,remoteStreamAvailable} = useSelector((state) => state.videoCall);

  const myVideo = useRef();
  const userVideo = useRef();
  const webrtcService = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messages = activeChat ? messagesByContact[activeChat.phoneNumber] || [] : [];

  useEffect(() => {
    if (videoClient.current && !webrtcService.current) {
      webrtcService.current = new WebRTCService(videoClient.current, dispatch, myVideo, userVideo,userObject.phoneNumber);
    }
  }, [videoClient.current, dispatch]);

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
    if (!videoClient.current || !userObject || !isConnected) return;

    const callSubscription = videoClient.current.subscribe(`/user/queue/call`, (payload) => {
      const { from, signalData } = JSON.parse(payload.body);
      dispatch(setIsReceivingCall(true));
      setIsCalling(true)
      dispatch(setCaller(from));
      dispatch(setOffer(signalData));
    });

    const acceptedSubscription = videoClient.current.subscribe(`/user/queue/call-accepted`, (payload) => {
      const { signal } = JSON.parse(payload.body);
      if (webrtcService.current && webrtcService.current.peer) {
        webrtcService.current.peer.signal(signal);
         dispatch(setInCall(true));
    dispatch(setIsCalling(false));
      }
    });


    const iceSubscription = videoClient.current.subscribe(
  `/user/queue/ice-candidate`,
  (payload) => {
    const { candidate } = JSON.parse(payload.body);
    if (candidate && webrtcService.current) {
      webrtcService.current.addIceCandidate(candidate);
    }
  }
  
);
const declinedSubscription = videoClient.current.subscribe(
  `/user/queue/call-declined`,
  (payload) => {
    console.log("Call was declined:", payload.body);
    webrtcService.current.closeConnection();
    dispatch(setInCall(false));
    dispatch(setIsReceivingCall(false));
    dispatch(setCaller(null));
    dispatch(setOffer(null));
    alert("The user declined your call."); // optional
  }
);
    return () => {
      callSubscription.unsubscribe();
      acceptedSubscription.unsubscribe();
      iceSubscription.unsubscribe();
      declinedSubscription.unsubscribe();
    };
  }, [videoClient.current, userObject, isConnected, dispatch]);

const callUser = (id) => {
  dispatch(setIsCalling(true));
  dispatch(setInCall(false));
  dispatch(setIsReceivingCall(false));

  webrtcService.current.getLocalStream().then(() => {
    webrtcService.current.initiateCall(id);
  });
};

const answerCall = () => {
  dispatch(setIsReceivingCall(false));
  webrtcService.current.getLocalStream().then(() => {
    webrtcService.current.answerCall(offer, caller);
    dispatch(setInCall(true));
    dispatch(setIsCalling(false)); // ✅ stop outgoing screen
  });
};

const leaveCall = () => {
  if (webrtcService.current) {
    videoClient.current.send("/app/decline-call", {}, JSON.stringify({
      to: caller,
      from: userObject.phoneNumber,
    }));
    webrtcService.current.closeConnection();
  }
  dispatch(setInCall(false));
  dispatch(setIsReceivingCall(false));
  dispatch(setIsCalling(false));
  dispatch(setCaller(null));
  dispatch(setOffer(null));
};

const declineCall = () => {
  if (videoClient.current && caller) {
    videoClient.current.send("/app/decline-call", {}, JSON.stringify({
      to: caller,
      from: userObject.phoneNumber,
    }));
  }
  webrtcService.current.closeConnection();
  dispatch(setIsReceivingCall(false));
  dispatch(setIsCalling(false));
  dispatch(setCaller(null));
  dispatch(setOffer(null));
};




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
    {/* Incoming Call */}
{isReceivingCall && !inCall && (
  <div className={styles.caller}>
    <img src="/default-avatar.png" alt="caller" className={styles.callerAvatar} />
    <h1>{caller} is calling you...</h1>
    <div className={styles.callActions}>
      <button className={`${styles.callButton} ${styles.answer}`} onClick={answerCall}>✅</button>
      <button className={`${styles.callButton} ${styles.decline}`} onClick={declineCall}>❌</button>
    </div>
  </div>
)}

{/* Outgoing Call */}
{isCalling &&  !remoteStreamAvailable && (
  <div className={styles.outgoingCall}>
    <img src="/default-avatar.png" alt="callee" className={styles.callerAvatar} />
    <h1>Calling {caller}<span className={styles.dots}></span></h1>
    <button className={`${styles.callButton} ${styles.decline}`} onClick={leaveCall}>
      ❌ Cancel
    </button>
  </div>
)}

{/* Active Video Call */}
{inCall && (
 <div className={styles.videoContainer}>
  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px", border:"2px solid green", borderRadius:"5px" }} />
  <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />

  <div className={styles.controls}>
    <button onClick={() => {
      setMicOn(!micOn);
      webrtcService.current.toggleMic(!micOn);
    }}>
      {micOn ? "🎙️ Mute" : "🔇 Unmute"}
    </button>

    <button onClick={() => {
      setCamOn(!camOn);
      webrtcService.current.toggleCam(!camOn);
    }}>
      {camOn ? "📷 Off" : "📷 On"}
    </button>

    <button onClick={() => webrtcService.current.switchCamera()}>
      🔄 Switch Camera
    </button>

    <button onClick={leaveCall} style={{ color: "red" }}>
      📴 End
    </button>
  </div>
</div>

)}



      </div>
    </>
  );
}