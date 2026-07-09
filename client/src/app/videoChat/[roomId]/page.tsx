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
import { useRouter } from "next/navigation";
import { videoChatSocket } from "@/lib/socket";
import {
  newUserAdded,
  clickOnMic,
  clickOnCamera,
  clickOnScreenShare,
  setUserMic,
  setUserCamera,
  setUserScreenSharing,
  userLeft,
  clearVideoChat,
} from "@/redux/videoChatSlice";
import "@/style/videoChat.css";
import * as mediasoupClient from "mediasoup-client";
import { showNotification } from "@/redux/notificationSlice";

type Participant = {
  name: string;
  socketId: string;
  pic: string;
  mic: boolean;
  camera: boolean;
  screenSharing: boolean;
};

type ChatMessage = {
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

type UserStreams = {
  camera?: MediaStream;
  screen?: MediaStream;
};

export default function VideoChat() {
  const Router = useRouter();
  const {
    id,
    name,
    roomId,
    roomName,
    UserNo: totalUsers,
    joinUser: participants,
  } = useSelector((state: RootState) => state.videoChat);
  // console.log(participants);
  const Dispatch = useDispatch();
  const micOn = participants[id]?.mic ?? true;
  const cameraOn = participants[id]?.camera ?? true;
  const screenShareOn = participants[id]?.screenSharing ?? false;
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const consumersRef = useRef<Consumers>({});
  const streamRef = useRef<MediaStream | null>(null);
  const streamListRef = useRef<{
    [userId: string]: UserStreams;
  }>({});
  const [, reRender] = useState(0);
  const bump = () => reRender((n) => n + 1);
  const screenProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const videoProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const audioProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const initializedRef = useRef(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const showGrid =
    totalUsers >= 3 ||
    (totalUsers === 2 &&
      Object.values(participants).some((p) => p.screenSharing));

  const cameraOnRef = useRef(cameraOn);
  const wasCameraOnBeforeHideRef = useRef(false);

  useEffect(() => {
    cameraOnRef.current = cameraOn;
  }, [cameraOn]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        const videoTrack = streamRef.current?.getVideoTracks()[0];
        if (videoTrack && cameraOnRef.current) {
          wasCameraOnBeforeHideRef.current = true;
          videoTrack.enabled = false;
          if (videoProducerRef.current) {
            videoProducerRef.current.pause();
            await emit("pauseProducer", {
              producerId: videoProducerRef.current.id,
            });
          }
          Dispatch(clickOnCamera());
        }
      } else if (document.visibilityState === "visible") {
        const videoTrack = streamRef.current?.getVideoTracks()[0];
        if (
          videoTrack &&
          wasCameraOnBeforeHideRef.current &&
          !cameraOnRef.current
        ) {
          videoTrack.enabled = true;
          if (videoProducerRef.current) {
            videoProducerRef.current.resume();
            await emit("resumeProducer", {
              producerId: videoProducerRef.current.id,
            });
          }
          Dispatch(clickOnCamera());
          wasCameraOnBeforeHideRef.current = false;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!id) {
      const stored = sessionStorage.getItem("user");
      if (!stored) {
        Router.replace("/");
      } else {
        Router.replace("/homePage");
      }
      return;
    }

    videoChatSocket.on("newUserJoin", (userId, user) => {
      console.log("newUserJoin");
      Dispatch(newUserAdded({ userId, user }));
      Dispatch(
        showNotification({
          message: `${user?.name ?? "Someone"} joined the call`,
          type: "info",
        }),
      );
    });

    videoChatSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    videoChatSocket.on("connect_error", () => {
      Dispatch(
        showNotification({
          message: "Connection lost. Trying to reconnect...",
          type: "error",
        }),
      );
    });

    return () => {
      videoChatSocket.off("newUserJoin");
      videoChatSocket.off("receiveMessage");
      videoChatSocket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  function emit(event: string, data: any = null) {
    return new Promise((resolve, reject) => {
      if (!videoChatSocket?.connected)
        return reject(new Error("Socket not connected"));
      data === null
        ? videoChatSocket.emit(event, resolve)
        : videoChatSocket.emit(event, data, resolve);
    });
  }

  const consume = async (producerId: string, screenShare: boolean) => {
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
    const userId = data.producerUserId;
    console.log({ userId });

    if (!streamListRef.current[userId]) {
      streamListRef.current[userId] = {};
    }

    if (!screenShare) {
      const stream = streamListRef.current[userId].camera ?? new MediaStream();
      stream.addTrack(consumer.track);
      streamListRef.current[userId].camera = stream;
    } else {
      const stream = streamListRef.current[userId].screen ?? new MediaStream();
      stream.addTrack(consumer.track);
      streamListRef.current[userId].screen = stream;
      Dispatch(setUserScreenSharing({ userId, screenSharing: true }));
    }
    bump();
  };

  const init = async () => {
    console.log("init Start");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log("Init - setStreamList");
    if (!streamListRef.current[id]) streamListRef.current[id] = {};
    streamRef.current = stream;
    streamListRef.current[id].camera = stream;
    bump();
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
    const producers = (await emit("getProducers")) as {
      producerId: string;
      source: string;
    }[];
    if (producers && producers.length > 0) {
      for (const { producerId, source } of producers) {
        try {
          await consume(producerId, source === "screen" ? true : false);
        } catch (err) {
          console.error("Failed to consume producer", producerId, err);
          Dispatch(
            showNotification({
              message: "Couldn't load a participant's stream",
              type: "error",
            }),
          );
        }
      }
    }
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      init();
    }

    videoChatSocket.on("newProducer", async ({ producerId, source }) => {
      await consume(producerId, source === "screen" ? true : false);
    });

    videoChatSocket.on("producerStateChanged", ({ userId, kind, paused }) => {
      if (kind === "audio") {
        Dispatch(setUserMic({ userId, mic: !paused }));
      } else {
        Dispatch(setUserCamera({ userId, camera: !paused }));
      }
    });

    videoChatSocket.on("producerClosed", ({ producerId, source, userId }) => {
      const consumer = consumersRef.current[producerId];
      if (consumer) {
        consumer.consumer.track.stop();
        consumer.consumer.close();
        consumer.transport.close();
        delete consumersRef.current[producerId];
      }

      if (source === "screen") {
        delete streamListRef.current[userId].screen;
      } else {
        delete streamListRef.current[userId].camera;
      }

      if (source === "screen") {
        Dispatch(setUserScreenSharing({ userId, screenSharing: false }));
      }
      bump();
    });

    videoChatSocket.on(
      "userLeft",
      (
        userId: string,
        producerIds: string[] = [],
        userName: string = "Someone",
      ) => {
        const userStreams = streamListRef.current[userId];
        if (producerIds && Array.isArray(producerIds)) {
          producerIds.forEach((producerId) => {
            const entry = consumersRef.current[producerId];
            if (entry) {
              entry.consumer.track.stop();
              entry.consumer.close();
              entry.transport.close();
              delete consumersRef.current[producerId];
            }
          });
        }
        if (userStreams) {
          userStreams.camera?.getTracks().forEach((track) => track.stop());
          userStreams.screen?.getTracks().forEach((track) => track.stop());
          delete streamListRef.current[userId];
        }
        Dispatch(userLeft({ userId }));
        Dispatch(
          showNotification({
            message: `${userName} left the call`,
            type: "info",
          }),
        );
        bump();
      },
    );

    const handleTabClose = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoChatSocket.connected) {
        videoChatSocket.disconnect();
      }
    };

    window.addEventListener("pagehide", handleTabClose);

    return () => {
      videoChatSocket.off("newProducer");
      videoChatSocket.off("producerStateChanged");
      videoChatSocket.off("producerClosed");
      videoChatSocket.off("userLeft");
      window.removeEventListener("pagehide", handleTabClose);
    };
  }, []);

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (trimmed == "") return;
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        senderName: "You",
        text: trimmed,
        time,
        isMe: true,
      },
    ]);
    setChatInput("");
    videoChatSocket.emit(
      "sendMessage",
      {
        senderName: name,
        text: trimmed,
        time,
        isMe: false,
      },
      id,
    );
  };

  async function startScreenShare() {
    if (!sendTransportRef.current || screenProducerRef.current) return;
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    screenStreamRef.current = screenStream;

    if (!streamListRef.current[id]) streamListRef.current[id] = {};
    streamListRef.current[id].screen = screenStream;
    bump();

    const videoTrack = screenStream.getVideoTracks()[0];

    const producer = await sendTransportRef.current.produce({
      track: videoTrack,
      appData: { source: "screen" },
    });
    screenProducerRef.current = producer;
    Dispatch(clickOnScreenShare());
    videoTrack.addEventListener("ended", () => {
      stopScreenShare();
    });
  }

  async function stopScreenShare() {
    const producer = screenProducerRef.current;
    if (!producer) return;

    const producerId = producer.id;

    producer.close();
    screenProducerRef.current = null;

    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    if (streamListRef.current[id]) {
      delete streamListRef.current[id].screen;
    }
    await emit("closeProducer", { producerId });

    Dispatch(clickOnScreenShare());
    bump();
  }

  async function EndCall() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    videoProducerRef.current?.close();
    videoProducerRef.current = null;
    audioProducerRef.current?.close();
    audioProducerRef.current = null;
    screenProducerRef.current?.close();
    screenProducerRef.current = null;
    Object.values(consumersRef.current).forEach(({ consumer, transport }) => {
      consumer.track?.stop();
      consumer.close();
      transport.close();
    });
    consumersRef.current = {};
    sendTransportRef.current?.close();
    sendTransportRef.current = null;
    deviceRef.current = null;
    streamListRef.current = {};
    setMessages([]);
    if (videoChatSocket.connected) {
      videoChatSocket.disconnect();
    }
    Dispatch(clearVideoChat());
    Router.push("/homePage");
  }

  const renderScreenTile = (
    userId: string,
    size: "full" | "big" | "pip" | "grid",
  ) => {
    const screenStream = streamListRef.current[userId]?.screen;

    return (
      <div
        key={`${userId}-screen`}
        className={`videoTile videoTile-${size} videoTile-screen`}
      >
        <video
          ref={(el: HTMLVideoElement | null) => {
            if (!el || !screenStream) return;
            if (el.srcObject !== screenStream) {
              el.srcObject = screenStream;
            }
          }}
          className="w-[100%] h-[100%]"
          autoPlay
          playsInline
          muted={userId === id}
        ></video>
        <div className="videoTile-info absolute bottom-2 left-2 flex items-center gap-1">
          <span className="videoTile-name">
            {userId === id
              ? "Your screen"
              : `${participants[userId].name}'s screen`}
          </span>
        </div>
      </div>
    );
  };

  const renderTile = (
    user: Participant,
    userId: string,
    isMe: boolean,
    size: "full" | "big" | "pip" | "grid",
  ) => {
    const tileMicOn = user?.mic ?? true;
    const tileCameraOn = user?.camera ?? true;
    console.log(streamListRef.current);

    return (
      <div
        key={userId}
        className={`videoTile videoTile-${size} ${isMe ? "videoTile-me" : ""}`}
      >
        {tileCameraOn && streamListRef.current[userId] ? (
          <span className="videoTile-bg absolute inset-0 bg-cover bg-center">
            <video
              ref={(el: HTMLVideoElement | null) => {
                if (!el) return;
                const stream = streamListRef.current[userId].camera;
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
            <div className="videoTile-avatarCircle bg-bg-surface border border-[var(--border-subtle)] flex items-center justify-center text-text-secondary overflow-hidden shrink-0">
              {user?.pic ? (
                <img
                  src={user.pic}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/userPic.jpg";
                  }}
                />
              ) : (
                <span className="text-[2.5rem] font-bold uppercase">
                  {user?.name ? user.name[0] : "?"}
                </span>
              )}
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
              Room ID: <span className="font-bold pe-1.5">{roomId}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="videoCall-userCount">
            <div className="videoCall-avatarStack flex items-center">
              {Object.entries(participants)
                .slice(0, 2)
                .map(([userId, participant], index) => (
                  <div
                    key={userId}
                    className="videoCall-avatarStackItem"
                    style={{
                      zIndex: 2 - index,
                      marginLeft: index === 0 ? 0 : "-12px",
                    }}
                    title={participant?.name || "Participant"}
                  >
                    {participant?.pic ? (
                      <img
                        src={participant.pic}
                        alt={participant.name || "Participant"}
                        className="videoCall-avatarStackImg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/userPic.jpg";
                        }}
                      />
                    ) : (
                      <span className="videoCall-avatarStackInitial">
                        {participant?.name ? participant.name[0] : "?"}
                      </span>
                    )}
                  </div>
                ))}

              {totalUsers > 2 && (
                <div
                  className="videoCall-avatarStackItem videoCall-avatarStackMore"
                  style={{ zIndex: 0, marginLeft: "-12px" }}
                  title={`${totalUsers - 2} more`}
                >
                  +{totalUsers - 2}
                </div>
              )}
            </div>
            {totalUsers} {totalUsers === 1 ? "participant" : "participants"}
          </span>
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
            !showGrid &&
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

          {showGrid && (
            <div
              className={`videoCallGrid ${(chatOpen || participantsOpen) && "activeChat"} `}
            >
              {Object.entries(participants).map(([userId, participant]) => (
                <>
                  <span key={userId}>
                    {renderTile(participant, userId, userId === id, "grid")}
                  </span>
                  {participant.screenSharing && (
                    <span key={`${userId}-screen`}>
                      {renderScreenTile(userId, "grid")}
                    </span>
                  )}
                </>
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

            <div
              ref={chatMessagesRef}
              className="videoCallSidePanel-body videoCallChatMessages "
            >
              {messages.length === 0 ? (
                <p className="videoCallSidePanel-empty">No messages yet</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.time}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                className="videoCallChatSendBtn"
                onClick={handleSendMessage}
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
                    <div className="videoCallParticipantRow-avatar bg-bg-surface border border-[var(--border-subtle)] flex items-center justify-center text-text-secondary overflow-hidden shrink-0">
                      {participant.pic ? (
                        <img
                          src={participant.pic}
                          alt={participant.name || "Participant"}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/userPic.jpg";
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold uppercase">
                          {participant.name ? participant.name[0] : "?"}
                        </span>
                      )}
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
          onClick={async () => {
            const audioTrack = streamRef.current?.getAudioTracks()[0];
            if (!audioTrack) return;
            const nextState = !micOn;
            audioTrack.enabled = nextState;
            if (nextState) {
              audioProducerRef.current?.resume();
              await emit("resumeProducer", {
                producerId: audioProducerRef.current?.id,
              });
            } else {
              audioProducerRef.current?.pause();
              await emit("pauseProducer", {
                producerId: audioProducerRef.current?.id,
              });
            }

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
            videoTrack.enabled = nextState;

            if (nextState) {
              videoProducerRef.current?.resume();
              await emit("resumeProducer", {
                producerId: videoProducerRef.current?.id,
              });
            } else {
              videoProducerRef.current?.pause();
              await emit("pauseProducer", {
                producerId: videoProducerRef.current?.id,
              });
            }

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
          onClick={() =>
            screenShareOn ? stopScreenShare() : startScreenShare()
          }
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
          onClick={EndCall}
          aria-label="End call"
        >
          <IoCall className="text-xl rotate-[135deg]" />
        </button>
      </footer>
    </div>
  );
}
