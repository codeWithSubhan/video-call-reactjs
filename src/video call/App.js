import { connect } from "twilio-video";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useEffect, useRef, useState } from "react";
import { patientData, userData, authToken } from "./patientData";
import "./index.css";
import "./Twilio.css";

const API_BASE_PATH = "https://staging-api.seniorconnex.com";

function App() {
  const [identity, setIdentity] = useState("");
  const [room, setRoom] = useState(null);

  function returnToLobby() {
    setRoom(null);
  }

  async function handleJoinRoom() {
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

  return (
    <div className="app">
      {room === null ? (
        <div className="lobby" onClick={handleJoinRoom}>
          <VideocamIcon fontSize="large" color="error" />
          <br />
          Start video Call
        </div>
      ) : (
        <Room returnToLobby={returnToLobby} room={room} />
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
