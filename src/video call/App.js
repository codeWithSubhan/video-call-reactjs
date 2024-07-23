import { connect } from "twilio-video";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useEffect, useRef, useState } from "react";
import { patientData, userData, authToken } from "./patientData";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./Twilio.css";

const API_BASE_PATH = "https://staging-api.seniorconnex.com";

function App() {
  const [identity, setIdentity] = useState("");
  const [room, setRoom] = useState(null);
  const ws = useRef(null);
  const [toastId, setToastId] = useState(null);

  function returnToLobby() {
    setRoom(null);
  }

  function sendMessage() {
    const send_message = {
      networkName: userData.network.networkName,
      // senderFirstName: userData.firstName,
      // senderLastName: userData.lastName,
      clientID: userData._id,
      // receiverFirstName: "jumman",
      // receiverLastName: "ansari",
      requestedID: "6685387a5c829c6d300d488d",
      type: "request_video_call",
      date: Date.now(),
    };
    ws.current.send(JSON.stringify(send_message));
  }

  async function handleJoinRoom() {
    if (ws.current.readyState !== WebSocket.OPEN)
      alert("WebSocket is not connected!");

    try {
      const response = await fetch(
        `${API_BASE_PATH}/twilio/getTwilioToken?id=${patientData._id}&roomName=${userData.network.networkName}&shouldInitiateCall=0`,
        {
          headers: {
            "content-type": "application/json",
            authorization: authToken,
          },
        }
      );
      const data = await response.json();
      console.log("data", data);

      const room = await connect(data.result.token, {
        name: userData.network.networkName,
        audio: true,
        video: true,
        preferredVideoCodecs: ["VP8"],
      });
      await fetch(
        `${API_BASE_PATH}/twilio/getTwilioToken?id=${patientData._id}&roomName=${userData.network.networkName}&shouldInitiateCall=1`,
        {
          headers: {
            "content-type": "application/json",
            authorization: authToken,
          },
        }
      );
      setRoom(room);
      console.log("room connected", room);

      sendMessage();
    } catch (err) {
      returnToLobby();
      alert(err.message);
    }
  }

  async function handleJoinRoom1() {
    if (ws.current.readyState !== WebSocket.OPEN)
      alert("WebSocket is not connected!");

    try {
      const response = await fetch(
        `${API_BASE_PATH}/twilio/getTwilioToken?id=${patientData._id}&roomName=${userData.network.networkName}&shouldInitiateCall=0`,
        {
          headers: {
            "content-type": "application/json",
            authorization: authToken,
          },
        }
      );
      const data = await response.json();
      console.log("data", data);

      const room = await connect(data.result.token, {
        name: userData.network.networkName,
        audio: true,
        video: true,
        preferredVideoCodecs: ["VP8"],
      });
      await fetch(
        `${API_BASE_PATH}/twilio/getTwilioToken?id=${patientData._id}&roomName=${userData.network.networkName}&shouldInitiateCall=1`,
        {
          headers: {
            "content-type": "application/json",
            authorization: authToken,
          },
        }
      );
      setRoom(room);
      console.log("room connected", room);
    } catch (err) {
      returnToLobby();
      alert(err.message);
    }
  }

  function storeData() {
    const send_message = {
      clientID: userData._id,
      type: "store_data",
    };
    ws.current.send(JSON.stringify(send_message));
  }

  const handleAnswerCall = async () => {
    toast.dismiss(toastId);
    console.log("Call answered");
    await handleJoinRoom1();
  };

  const handleDeclineCall = () => {
    toast.dismiss(toastId);
    console.log("Call declined");
  };

  useEffect(() => {
    ws.current = new WebSocket(`ws://192.168.1.2:8080`);

    ws.current.addEventListener("open", () => {
      console.log("WebSocket connected");
      storeData();
    });

    ws.current.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      console.log("Received from server:", data);

      const { type } = data;
      if (type === "request_video_call") {
        const id = toast(
          <div>
            <p>Video Calling...</p>
            <div>
              <button onClick={handleAnswerCall}>answer</button>
              <button onClick={handleDeclineCall}>decline</button>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            // onClose: () => console.log("Called when I close"),
            progress: undefined,
            theme: "light",
            transition: Slide,
          }
        );
        setToastId(id);
      }
    });

    ws.current.addEventListener("error", (error) => {
      console.error("WebSocket error:", error.message);
      ws.current.close();
    });

    return () => ws.current.close();
  }, []);

  return (
    <div className="app">
      <ToastContainer
        position="top-center"
        autoClose={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
        transition={Slide}
      />
      {room === null ? (
        <div className="lobby" onClick={handleJoinRoom}>
          <VideocamIcon fontSize="large" color="error" />
          <br />
          Start video Call
        </div>
      ) : (
        <Room
          returnToLobby={returnToLobby}
          room={room}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
}

export default App;

function Room({ returnToLobby, room }) {
  const [remoteParticipants, setRemoteParticipants] = useState(
    Array.from(room.participants.values())
  );

  function leaveRoom() {
    room.disconnect();
    returnToLobby();
  }

  useEffect(() => {
    function addParticipant(participant) {
      setRemoteParticipants((prevParticipants) => [
        ...prevParticipants,
        participant,
      ]);
    }

    function removeParticipant(participant) {
      setRemoteParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    }

    room.on("participantConnected", addParticipant);
    room.on("participantDisconnected", removeParticipant);
    window.addEventListener("beforeunload", leaveRoom);

    return () => {
      room.off("participantConnected", addParticipant);
      room.off("participantDisconnected", removeParticipant);
      window.removeEventListener("beforeunload", leaveRoom);
    };
  }, [room]);

  return (
    <div className="room">
      <div className="participants">
        <Participant
          key={room.localParticipant.identity}
          localParticipant="true"
          participant={room.localParticipant}
        />
        {remoteParticipants.map((participant) => (
          <Participant key={participant.identity} participant={participant} />
        ))}
      </div>
      <button id="leaveRoom" onClick={leaveRoom}>
        Disconnect
      </button>
    </div>
  );
}

function Participant({ localParticipant, participant }) {
  const existingPublications = Array.from(participant.tracks.values());
  const existingTracks = existingPublications.map(
    (publication) => publication.track
  );
  const nonNullTracks = existingTracks.filter((track) => track !== null);
  const [tracks, setTracks] = useState(nonNullTracks);

  function addTrack(track) {
    setTracks((prevTracks) => [...prevTracks, track]);
  }

  useEffect(() => {
    if (localParticipant) return;

    function handleTrackSubscribed(track) {
      addTrack(track);
    }

    participant.on("trackSubscribed", handleTrackSubscribed);

    return () => participant.off("trackSubscribed", handleTrackSubscribed);
  }, [participant, localParticipant]);

  return (
    <div className="participant" id={participant.identity}>
      {tracks.map((track) => (
        <Track key={track} track={track} />
      ))}
    </div>
  );
}

function Track({ track }) {
  const ref = useRef();

  useEffect(() => {
    if (track) {
      const child = track.attach();
      document.querySelector("#check__subhan").classList.add(track.kind);
      document.querySelector("#check__subhan").appendChild(child);
    }
  }, [track]);

  return <div id={"check__subhan"} className="track" ref={ref}></div>;
}
