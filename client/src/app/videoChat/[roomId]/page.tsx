"use client";

import { useEffect, useState, useRef } from "react";
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
import {
  newUserAdded,
  clickOnMic,
  clickOnCamera,
  setUserMic,
  setUserCamera,
} from "@/redux/videoChatSlice";
import "@/style/videoChat.css";
import * as mediasoupClient from "mediasoup-client";

type Participant = {
  name: string;
  socketId: string;
  pic: string;
  mic: boolean;
  camera: boolean;
};

type ChatMessage = {
  id: string;
  senderName: string;
  text: string;
  time: string;
  isMe?: boolean;
};

type Consumers = {
  [producerId: string]: {
    consumer: mediasoupClient.types.Consumer;
    transport: mediasoupClient.types.Transport;
  };
};

type TransportParams = {
  id: string;
  iceParameters: mediasoupClient.types.IceParameters;
  iceCandidates: mediasoupClient.types.IceCandidate[];
  dtlsParameters: mediasoupClient.types.DtlsParameters;
};

type ConsumeResponse = {
  id: string;
  producerId: string;
  kind: "audio" | "video";
  rtpParameters: mediasoupClient.types.RtpParameters;
  producerUserId: string;
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
    joinUser: participants,
  } = useSelector((state: RootState) => state.videoChat);
  // console.log(participants);
  const Dispatch = useDispatch();
  const [micOn, setMicOn] = useState<boolean>(participants[id].mic);
  const [cameraOn, setCameraOn] = useState<boolean>(participants[id].camera);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [chatInput, setChatInput] = useState("");

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const consumersRef = useRef<Consumers>({});
  const streamRef = useRef<MediaStream | null>(null);
  const streamListRef = useRef<{
    [userId: string]: MediaStream;
  }>({});
  const [, reRender] = useState(0);
  const bump = () => reRender((n) => n + 1);
  const videoProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const audioProducerRef = useRef<mediasoupClient.types.Producer | null>(null);

  useEffect(() => {
    videoChatSocket.on("newUserJoin", (userId, user) => {
      console.log("newUserJoin");
      Dispatch(newUserAdded({ userId, user }));
    });

    return () => {
      videoChatSocket.off("newUserJoin");
    };
  }, []);

  function emit(event: string, data: any = null) {
    return new Promise((resolve, reject) => {
      if (!videoChatSocket?.connected)
        return reject(new Error("Socket not connected"));
      data === null
        ? videoChatSocket.emit(event, resolve)
        : videoChatSocket.emit(event, data, resolve);
    });
  }

  const consume = async (producerId: string) => {
    console.log("consume Start");
    if (
      consumersRef.current == null ||
      deviceRef.current == null ||
      producerId in consumersRef.current
    )
      return;
    console.log("consume - transportParams");
    const transportParams: TransportParams = (await emit(
      "createRecvTransport",
    )) as TransportParams;
    const transportId = transportParams.id;
    const recvTransport =
      deviceRef.current.createRecvTransport(transportParams);
    console.log("consume - recvTransport");
    recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      emit("connectRecvTransport", { transportId, dtlsParameters })
        .then(callback)
        .catch(errback);
    });
    console.log("consume - data");
    const data: ConsumeResponse = (await emit("consume", {
      producerId,
      transportId,
      rtpCapabilities: deviceRef.current.rtpCapabilities,
    })) as ConsumeResponse;
    console.log("consume - consumer");
    const consumer = await recvTransport.consume({
      id: data.id,
      producerId: data.producerId,
      kind: data.kind,
      rtpParameters: data.rtpParameters,
    });
    await emit("resumeConsumer", {
      consumerId: consumer.id,
    });
    consumer.track.enabled = true;
    consumersRef.current[producerId] = {
      consumer,
      transport: recvTransport,
    };
    // const stream = new MediaStream([consumer.track]);
    // const videoEl = document.getElementById(
    //   `remoteVideo-${userId}`,
    // ) as HTMLVideoElement | null;
    // if (videoEl) videoEl.srcObject = stream;
    const userId = data.producerUserId;
    console.log({ userId });
    const stream = streamListRef.current[userId] ?? new MediaStream();
    stream.addTrack(consumer.track);
    streamListRef.current[userId] = stream;
    bump();
  };

  const init = async () => {
    console.log("init Start");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log("Init - setStreamList");
    streamRef.current = stream;
    streamListRef.current[id] = stream;
    bump();
    // const localVideo = document.getElementById("localVideo");
    // if (localVideo) {
    //   (localVideo as HTMLVideoElement).srcObject = stream;
    // }
    const rtpCapabilities: mediasoupClient.types.RtpCapabilities = (await emit(
      "getRtpCapabilities",
    )) as mediasoupClient.types.RtpCapabilities;
    console.log("Init - rtpCapabilities ");
    const device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = device;
    const transportParams: TransportParams = (await emit(
      "createSendTransport",
    )) as TransportParams;
    console.log("Init - transportParams ");
    const sendTransport = device.createSendTransport(transportParams);
    sendTransportRef.current = sendTransport;
    sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      emit("connectSendTransport", { dtlsParameters })
        .then(callback)
        .catch(errback);
    });
    console.log("Init - sendTransport(connect) ");
    sendTransport.on(
      "produce",
      ({ kind, rtpParameters, appData }, callback, errback) => {
        emit("produce", { kind, rtpParameters, appData })
          .then((r) => callback({ id: r.id }))
          .catch(errback);
      },
    );
    console.log("Init - sendTransport(produce) ");
    for (const track of stream.getTracks()) {
      const producer = await sendTransport.produce({
        track,
        appData: { source: track.kind === "video" ? "camera" : "mic" },
      });
      if (track.kind === "video") {
        videoProducerRef.current = producer;
      } else {
        audioProducerRef.current = producer;
      }
    }
    console.log("Init - ", streamListRef.current);
    const producers = (await emit("getProducers")) as { producerId: string }[];
    if (producers && producers.length > 0) {
      for (const { producerId } of producers) {
        try {
          await consume(producerId);
        } catch (err) {
          console.error("Failed to consume producer", producerId, err);
        }
      }
    }
  };

  useEffect(() => {
    init();
    videoChatSocket.on("newProducer", async ({ producerId }) => {
      await consume(producerId);
    });

    videoChatSocket.on("producerStateChanged", ({ userId, kind, paused }) => {
    if (kind === "audio") {
      Dispatch(setUserMic({ userId, mic: !paused }));
    } else {
      Dispatch(setUserCamera({ userId, camera: !paused }));
    }
  });

    return () => {
      videoChatSocket.off("newProducer");
      videoChatSocket.off("producerStateChanged");
    };
  }, []);

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
    const tileMicOn = user.mic;
    const tileCameraOn = user.camera;
    console.log(streamListRef.current);

    return (
      <div
        key={userId}
        className={`videoTile videoTile-${size} ${isMe ? "videoTile-me" : ""}`}
      >
        {tileCameraOn ? (
          <span className="videoTile-bg absolute inset-0 bg-cover bg-center">
            <video
              ref={(el: HTMLVideoElement | null) => {
                if (!el) return;
                const stream = streamListRef.current[userId];
                if (stream && el.srcObject !== stream) {
                  el.srcObject = stream;
                }
              }}
              id={`${isMe ? "localVideo" : `remoteVideo-${userId}`}`}
              className="w-[100%] h-[100%]"
              autoPlay
              playsInline
              muted={isMe}
            ></video>
          </span>
        ) : (
          <div className="videoTile-avatarFallback absolute inset-0 flex items-center justify-center">
            <div
              className="videoTile-avatarCircle bg-center bg-cover"
              style={{ backgroundImage: `url(${user.pic})` }}
            ></div>
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
              Room ID: <span className="font-bold pe-1.5">{roomId}</span>
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
            <div className="videoCallGrid">
              {Object.entries(participants).map(([userId, participant]) => (
                <span key={userId}>
                  {renderTile(participant, userId, userId === id, "grid")}
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
                    <div
                      className="videoCallParticipantRow-avatar bg-center bg-cover"
                      style={{ backgroundImage: `url(${participant.pic})` }}
                    ></div>
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
          onClick={async () => {
            const audioTrack = streamRef.current?.getAudioTracks()[0];
            if (!audioTrack) return;
            const nextState = !micOn;

            if (nextState) {
              audioTrack.enabled = true;
              await audioProducerRef.current?.resume();
              await emit("resumeProducer", {
                producerId: audioProducerRef.current?.id,
              });
            } else {
              audioTrack.enabled = false;
              await audioProducerRef.current?.pause();
              await emit("pauseProducer", {
                producerId: audioProducerRef.current?.id,
              });
            }

            setMicOn(nextState);
            Dispatch(clickOnMic());
          }}
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
          onClick={async () => {
            const videoTrack = streamRef.current?.getVideoTracks()[0];
            if (!videoTrack) return;
            const nextState = !cameraOn;

            if (nextState) {
              videoTrack.enabled = true;
              await videoProducerRef.current?.resume();
              await emit("resumeProducer", {
                producerId: videoProducerRef.current?.id,
              });
            } else {
              videoTrack.enabled = false;
              await videoProducerRef.current?.pause();
              await emit("pauseProducer", {
                producerId: videoProducerRef.current?.id,
              });
            }

            setCameraOn(nextState);
            Dispatch(clickOnCamera());
          }}
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
          onClick={() => setScreenShareOn((prev) => !prev)}
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
            setChatOpen((prev) => !prev);
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
            setParticipantsOpen((prev) => !prev);
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
