import Peer from "simple-peer";
import { setInCall, setRemoteStream } from "../store/slices/videoCallSlice";

class WebRTCService {
  constructor(socket, dispatch, myVideo, userVideo) {
    this.socket = socket;
    this.dispatch = dispatch;
    this.myVideo = myVideo;
    this.userVideo = userVideo;
    this.peer = null; 
    this.localStream = null;
  }

  getLocalStream() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  }

  initiateCall(targetUsername, localStream, userObject) {
    this.localStream = localStream;
    if (this.myVideo.current) {
      this.myVideo.current.srcObject = localStream;
    }

    this.peer= new Peer({
      initiator: true,
      trickle: true,
      stream: localStream,
    });

    this.peer.on("signal", (offer) => {
      if (this.socket) {
        this.socket.send(
          "/app/call-user",
          {},
          JSON.stringify({
            userToCall: targetUsername,
            signalData: offer,
            from: userObject.phoneNumber,
          })
        );
      }
    });

    this.peer.on("stream", (remoteStream) => {
      if (this.userVideo.current) {
        this.userVideo.current.srcObject = remoteStream;
      }
      this.dispatch(setRemoteStream(remoteStream));
      this.dispatch(setInCall(true));
    });
  }

  handleOffer(offer, sender, localStream) {
    this.localStream = localStream;
    if (this.myVideo.current) {
      this.myVideo.current.srcObject = localStream;
    }

    this.peer = new Peer({
      initiator: false,
      trickle: true,
      stream: localStream,
    });

    this.peer.on("signal", (answer) => {
      if (this.socket) {
        this.socket.send(
          "/app/answer-call",
          {},
          JSON.stringify({ signal: answer, to: sender })
        );
      }
    });

    this.peer.on("stream", (remoteStream) => {
      if (this.userVideo.current) {
        this.userVideo.current.srcObject = remoteStream;
      }
      this.dispatch(setRemoteStream(remoteStream));
      this.dispatch(setInCall(true));
    });

    this.peer.signal(offer);
  }

  handleAnswer(answer) {
    if (this.peer) {
      this.peer.signal(answer);
    }
  }

  handleIceCandidate(candidate) {
    // Not needed with simple-peer
    if (this.peer) {
      this.peer.signal(candidate);
    }
  }

  closeConnection() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.myVideo.current) {
      this.myVideo.current.srcObject = null;
    }
    if (this.userVideo.current) {
      this.userVideo.current.srcObject = null;
    }
    this.dispatch(setInCall(false));
  }
}

export default WebRTCService;
