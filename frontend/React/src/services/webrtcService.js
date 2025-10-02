// src/services/WebRTCService.js
import SimplePeer from "simple-peer";
import { setRemoteStreamAvailable } from "../store/slices/videoCallSlice";
export default class WebRTCService {
  constructor(stompClient, dispatch, myVideoRef, userVideoRef, from) {
    if (!stompClient) throw new Error("STOMP client is required for WebRTCService");

    this.socket = stompClient;
    this.dispatch = dispatch;
    this.myVideoRef = myVideoRef;
    this.userVideoRef = userVideoRef;
    this.peer = null;
    this.localStream = null;
    this.targetUser = null; // keep track of who we’re calling
    this.from = from;
  }

  // ✅ Call this directly from ChatPage before call/answer
  async getLocalStream() {
    if (!this.localStream) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (this.myVideoRef?.current) {
          this.myVideoRef.current.srcObject = this.localStream;
        }
      } catch (err) {
        console.error("Failed to get local media stream:", err);
      }
    }
    return this.localStream;
  }
  toggleMic(enabled) {
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(track => track.enabled = enabled);
  }
}

toggleCam(enabled) {
  if (this.localStream) {
    this.localStream.getVideoTracks().forEach(track => track.enabled = enabled);
  }
}

async switchCamera() {
  if (!navigator.mediaDevices || !this.localStream) return;

  // stop current video track
  this.localStream.getVideoTracks().forEach(track => track.stop());

  // request new video source (front/back)
  const constraints = {
    video: { facingMode: this.isFront ? "environment" : "user" },
    audio: true,
  };
  this.isFront = !this.isFront;

  const newStream = await navigator.mediaDevices.getUserMedia(constraints);
  const newTrack = newStream.getVideoTracks()[0];
  const sender = this.peer._pc.getSenders().find(s => s.track.kind === "video");
  sender.replaceTrack(newTrack);

  // replace local reference
  this.localStream.removeTrack(this.localStream.getVideoTracks()[0]);
  this.localStream.addTrack(newTrack);

  if (this.myVideoRef?.current) {
    this.myVideoRef.current.srcObject = this.localStream;
  }
}


  // ================================
  // 📞 Call Initiator
  // ================================
  initiateCall(targetUserPhone) {
    if (!this.localStream) {
      console.warn("Local stream not initialized");
      return;
    }

    this.targetUser = targetUserPhone;

    this.peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream: this.localStream,
    });

    this._setupPeerEvents(targetUserPhone, "offer");
  }

  // ================================
  // 📞 Call Receiver
  // ================================
  answerCall(signal, callerPhone) {
    if (!this.localStream) {
      console.warn("Local stream not initialized");
      return;
    }

    this.targetUser = callerPhone;

    this.peer = new SimplePeer({
      initiator: false,
      trickle: true,
      stream: this.localStream,
    });

    this._setupPeerEvents(callerPhone, "answer");

    // Accept the caller’s offer
    this.peer.signal(signal);
  }

  // ================================
  // 🔗 Handle Peer Events
  // ================================
  _setupPeerEvents(targetUserPhone, mode) {
    this.peer.on("signal", (data) => {
      if (data.type === "offer") {
        this.socket.send(
          "/app/call-user",
          {},
          JSON.stringify({
            userToCall: targetUserPhone,
            signalData: data,
            from: this.from || "",
          })
        );
      } else if (data.type === "answer") {
        this.socket.send(
          "/app/answer-call",
          {},
          JSON.stringify({
            signal: data,
            to: targetUserPhone,
            from: this.from || "",
          })
        );
      } else if (data.candidate) {
        this.socket.send(
          "/app/ice-candidate",
          {},
          JSON.stringify({
            target: targetUserPhone,
            candidate: data,
            from: this.from || "",
          })
        );
      }
    });

    this.peer.on("stream", (remoteStream) => {
      this.dispatch(setRemoteStreamAvailable(true));
      console.log("Received remote stream:", remoteStream);
      if (this.userVideoRef?.current) {
        this.userVideoRef.current.srcObject = remoteStream;
      }
    });

    this.peer.on("error", (err) => console.error("Peer error:", err));
  }

  // ================================
  // 📡 Handle ICE Candidates
  // ================================
  addIceCandidate(candidate) {
    if (this.peer) {
      try {
        this.peer.signal(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  }

  // ================================
  // 🔒 Cleanup
  // ================================
  destroyPeer() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  closeConnection() {
    // ✅ Stop all local media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Clear video refs
    if (this.myVideoRef?.current) {
      this.myVideoRef.current.srcObject = null;
    }
    if (this.userVideoRef?.current) {
      this.userVideoRef.current.srcObject = null;
    }

    this.destroyPeer();
    this.targetUser = null;
  }
}
