"use client";

import { useEffect, useState } from "react";
import {
  IoMic,
  IoMicOff,
  IoVideocam,
  IoVideocamOff,
  IoChatbubbleEllipsesOutline,
  IoChatbubbleEllipses,
  IoCall,
  IoPeople,
  IoPeopleOutline,
  IoTrash,
  IoPersonAdd,
  IoClose,
  IoSend,
} from "react-icons/io5";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { videoChatSocket } from "@/lib/socket";
import { newUserAdded } from "@/redux/videoChatSlice";
import "@/style/videoChat.css";

type Participant = {
  name: string;
  socketId: string;
  pic: string;
  mic: "on" | "off";
  camera: "on" | "off";
};

type ChatMessage = {
  id: string;
  senderName: string;
  text: string;
  time: string;
  isMe?: boolean;
};

const defaultMessages: ChatMessage[] = [
  {
    id: "m1",
    senderName: "Alice",
    text: "Hey, can everyone see my screen?",
    time: "10:21 AM",
  },
  {
    id: "m2",
    senderName: "You",
    text: "Yep, looks good on my end!",
    time: "10:22 AM",
    isMe: true,
  },
  { id: "m3", senderName: "Bob", text: "Same here 👍", time: "10:23 AM" },
];

export default function VideoChat() {
  const {
    id,
    roomId,
    roomName,
    UserNo: totalUsers,
    joinUser: Users,
  } = useSelector((state: RootState) => state.videoChat);
  const Dispatch = useDispatch();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participants, setParticipants] = useState(Users);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [chatInput, setChatInput] = useState("");

  useEffect(()=>{
    videoChatSocket.on("newUserJoin",(userId,user)=>{
      Dispatch(newUserAdded({userId,user}));
    });

    return ()=>{
      videoChatSocket.off("newUserJoin");
    }

  },[])

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: ``,
        senderName: "You",
        text: trimmed,
        time,
        isMe: true,
      },
    ]);
    setChatInput("");
  };

  const renderTile = (
    user: Participant,
    userId: string,
    isMe: boolean,
    size: "full" | "big" | "pip" | "grid",
  ) => {
    const tileMicOn = isMe ? micOn : (user.mic ?? true);
    const tileCameraOn = isMe ? cameraOn : (user.camera ?? true);

    return (
      <div
        key={userId}
        className={`videoTile videoTile-${size} ${isMe ? "videoTile-me" : ""}`}
      >
        {tileCameraOn ? (
          <span
            className="videoTile-bg absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.pic || "userPic.jpg"})` }}
          />
        ) : (
          <div className="videoTile-avatarFallback absolute inset-0 flex items-center justify-center">
            <div className="videoTile-avatarCircle">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="videoTile-info absolute bottom-2 left-2 flex items-center gap-1">
          <span
            className={`videoTile-micDot ${tileMicOn ? "mic-on" : "mic-off"}`}
          >
            {tileMicOn ? <IoMic /> : <IoMicOff />}
          </span>
          <span className="videoTile-name">{isMe ? "You" : user.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="videoCallOverlay flex flex-col h-full">
      <header className="videoCallHeader flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <IoVideocam className="text-4xl text-accent-purple-light" />
            <p className="font-bold text-[1.1rem]">MeetUp</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="videoCall-title ms-2">{roomName}</span>
            <span className="videoCall-roomId">
              ID:<span className="font-bold">{roomId}</span>{" "}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="videoCall-userCount">
            {totalUsers} {totalUsers === 1 ? "participant" : "participants"}
          </span>
          <span className="videoCall-timer">00:00</span>
        </div>
      </header>

      <div className="videoCallBody flex-1 min-h-0 flex relative">
        <div
          className={`videoCallStage flex-1 min-h-0 p-4 videoCallStage-${
            totalUsers === 1 ? "one" : totalUsers === 2 ? "two" : "grid"
          }`}
        >
          {totalUsers === 1 && renderTile(participants[id], id, true, "full")}

          {totalUsers === 2 &&
            (() => {
              const secondId = Object.keys(participants).find(
                (userId) => userId !== id,
              );
              if (!secondId) return null;
              return (
                <div className="videoCallPipWrap">
                  {renderTile(participants[secondId], secondId, false, "big")}
                  {renderTile(participants[id], id, true, "pip")}
                </div>
              );
            })()}

          {totalUsers >= 3 && (
            <div className="videoCallGrid flex flex-wrap gap-3">
              {Object.entries(participants).map(([userId, participant]) => (
                <span key={userId}>
                  {renderTile(participant,userId, userId === id, "grid")}
                </span>
              ))}
            </div>
          )}
        </div>

        {chatOpen && (
          <div className="videoCallSidePanel">
            <div className="videoCallSidePanel-header">
              <span>Chat</span>
              <button
                type="button"
                className="videoCallSidePanel-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                <IoClose />
              </button>
            </div>

            <div className="videoCallSidePanel-body videoCallChatMessages">
              {messages.length === 0 ? (
                <p className="videoCallSidePanel-empty">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`videoCallChatBubbleRow ${
                      m.isMe ? "videoCallChatBubbleRow-me" : ""
                    }`}
                  >
                    <div className="videoCallChatBubble">
                      {!m.isMe && (
                        <span className="videoCallChatBubble-name">
                          {m.senderName}
                        </span>
                      )}
                      <p className="videoCallChatBubble-text">{m.text}</p>
                      <span className="videoCallChatBubble-time">{m.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="videoCallChatInputRow">
              <input
                type="text"
                className="videoCallChatInput"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                // onKeyDown={handleChatKeyDown}
              />
              <button
                type="button"
                className="videoCallChatSendBtn"
                // onClick={handleSendMessage}
                aria-label="Send message"
              >
                <IoSend />
              </button>
            </div>
          </div>
        )}

        {participantsOpen && (
          <div className="videoCallSidePanel">
            <div className="videoCallSidePanel-header">
              <span>Participants ({totalUsers})</span>
              <button
                type="button"
                className="videoCallSidePanel-close"
                onClick={() => setParticipantsOpen(false)}
                aria-label="Close participants"
              >
                <IoClose />
              </button>
            </div>

            <div className="videoCallSidePanel-body videoCallParticipantList">
              {Object.entries(participants).map(([userId, participant]) => {
                const isMe = userId === id;
                return (
                  <div key={userId} className="videoCallParticipantRow">
                    <div className="videoCallParticipantRow-avatar">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="videoCallParticipantRow-info">
                      <span className="videoCallParticipantRow-name">
                        {isMe ? "You" : participant.name}
                      </span>
                      <span className="videoCallParticipantRow-id">
                        ID: {userId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="videoCallControls flex items-center justify-center gap-4 py-5">
        <button
          type="button"
          className={`videoCallControlBtn ${!micOn ? "videoCallControlBtn-off" : ""}`}
          onClick={() => setMicOn((v) => !v)}
          aria-label="Toggle microphone"
        >
          {micOn ? (
            <IoMic className="text-xl" />
          ) : (
            <IoMicOff className="text-xl" />
          )}
        </button>
        <button
          type="button"
          className={`videoCallControlBtn ${!cameraOn ? "videoCallControlBtn-off" : ""}`}
          onClick={() => setCameraOn((v) => !v)}
          aria-label="Toggle camera"
        >
          {cameraOn ? (
            <IoVideocam className="text-xl" />
          ) : (
            <IoVideocamOff className="text-xl" />
          )}
        </button>
        <button
          type="button"
          className={`videoCallControlBtn ${
            screenShareOn ? "videoCallControlBtn-active" : ""
          }`}
          onClick={() => setScreenShareOn((v) => !v)}
          aria-label="Share screen"
        >
          {screenShareOn ? (
            <MdStopScreenShare className="text-xl" />
          ) : (
            <MdScreenShare className="text-xl" />
          )}
        </button>
        <button
          type="button"
          className={`videoCallControlBtn ${chatOpen ? "videoCallControlBtn-active" : ""}`}
          onClick={() => {
            setChatOpen((v) => !v);
            setParticipantsOpen(false);
          }}
          aria-label="Toggle chat"
        >
          {chatOpen ? (
            <IoChatbubbleEllipses className="text-xl" />
          ) : (
            <IoChatbubbleEllipsesOutline className="text-xl" />
          )}
        </button>
        <button
          type="button"
          className={`videoCallControlBtn ${
            participantsOpen ? "videoCallControlBtn-active" : ""
          }`}
          onClick={() => {
            setParticipantsOpen((v) => !v);
            setChatOpen(false);
          }}
          aria-label="Toggle participants list"
        >
          {participantsOpen ? (
            <IoPeople className="text-xl" />
          ) : (
            <IoPeopleOutline className="text-xl" />
          )}
        </button>
        <button
          type="button"
          className="videoCallEndBtn"
          // onClick={onEndCall}
          aria-label="End call"
        >
          <IoCall className="text-xl rotate-[135deg]" />
        </button>
      </footer>
    </div>
  );
}
