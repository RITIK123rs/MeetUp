import { Namespace } from "socket.io";
// import mediasoup from "mediasoup";
import * as mediasoup from "mediasoup";

interface Users {
  [userId: string]: {
    socketId: string;
    name: string | undefined;
    pic: string | undefined;
    roomId: string | undefined;
    mic: boolean;
    camera: boolean;
    screenSharing: boolean;
  };
}

interface Rooms {
  [roomId: string]: {
    roomName: string;
    userNo: number;
    userId: string[];
    createdBy: string;
  };
}

interface Peers {
  [SocketId: string]: {
    userId: string;
    sendTransport: mediasoup.types.WebRtcTransport | null;
    recvTransports: { [transportId: string]: mediasoup.types.WebRtcTransport }; // transportId → transport
    producers: mediasoup.types.Producer[];
    consumers: mediasoup.types.Consumer[];
  };
}

type MediaCodecs = {
  kind: "audio" | "video";
  mimeType: string;
  clockRate: number;
  channels?: number;
};

const mediaCodecs: MediaCodecs[] = [
  { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
  { kind: "video", mimeType: "video/VP8", clockRate: 90000 },
];

let worker: mediasoup.types.Worker;
let router: mediasoup.types.Router;

let rooms: Rooms = {};
let users: Users = {};
let peers: Peers = {};
const producerOwners: { [producerId: string]: string } = {};

async function init() {
  worker = await mediasoup.createWorker({ rtcMinPort: 2000, rtcMaxPort: 2100 });
  worker.on("died", () => process.exit(1));
  router = await worker.createRouter({ mediaCodecs });
  console.log("mediasoup router ready");
}

async function createTransport(): Promise<mediasoup.types.WebRtcTransport> {
  return router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });
}

type TransportParams = {
  id: string;
  iceParameters: mediasoup.types.IceParameters;
  iceCandidates: mediasoup.types.IceCandidate[];
  dtlsParameters: mediasoup.types.DtlsParameters;
};

function getParams(t: mediasoup.types.WebRtcTransport): TransportParams {
  return {
    id: t.id,
    iceParameters: t.iceParameters,
    iceCandidates: t.iceCandidates,
    dtlsParameters: t.dtlsParameters,
  };
}

export default async function initializeVideoCallSocket(videoChat: Namespace) {
  await init();

  videoChat.on("connection", (socket) => {
    console.log("video Call User Connected :- ", socket.id, { rooms, users });

    socket.on("CheckNewGenID", (id, callback) => {
      if (id in rooms) callback(false);
      else callback(true);
    });

    socket.on("createRoom", (roomId, roomName, id, user) => {
      users[id] = user;
      peers[socket.id] = {
        userId: id,
        sendTransport: null,
        recvTransports: {},
        producers: [],
        consumers: [],
      };
      rooms[roomId] = {
        roomName,
        userNo: 1,
        userId: [id],
        createdBy: id,
      };
      socket.join(roomId);
      console.log({ users, rooms }, rooms[roomId].userId);
      console.log(socket.id, " create Room :- ", roomId);
    });

    socket.on("joinRoom", (roomId, id, user, callback) => {
      const room = rooms[roomId];
      if (!room) {
        callback(false);
        return;
      }
      users[id] = user;
      peers[socket.id] = {
        userId: id,
        sendTransport: null,
        recvTransports: {},
        producers: [],
        consumers: [],
      };
      rooms[roomId].userId.push(id);
      rooms[roomId].userNo += 1;
      const roomInfo = rooms[roomId];
      let joinUser: Users = {};
      roomInfo.userId.forEach((Id) => {
        joinUser[Id] = users[Id];
      });
      console.log({ joinUser });
      socket.join(roomId);
      console.log({ users, rooms, joinUser }, rooms[roomId].userId);
      console.log(socket.id, " joined :- ", roomId);
      socket.to(roomId).emit("newUserJoin", id, user);
      callback(
        true,
        roomInfo.roomName,
        roomInfo.createdBy,
        joinUser,
        roomInfo.userNo,
      );
    });

    socket.on("getRtpCapabilities", (callBack) => {
      callBack(router.rtpCapabilities);
    });

    socket.on("createSendTransport", async (callBack) => {
      const peer = peers[socket.id];
      if (!peer) return callBack(null);
      const transport = await createTransport();
      peer.sendTransport = transport;
      callBack({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    });

    socket.on("connectSendTransport", async ({ dtlsParameters }, callback) => {
      const transport = peers[socket.id]?.sendTransport;
      if (transport) {
        await transport.connect({ dtlsParameters });
      }
      callback();
    });

    socket.on("produce", async ({ kind, rtpParameters, appData }, callback) => {
      const peer = peers[socket.id];
      if (!peer) return callback();
      let producer: mediasoup.types.Producer;
      if (!peer.sendTransport) return callback();

      producer = await peer.sendTransport.produce({
        kind,
        rtpParameters,
        appData,
      });

      peer.producers.push(producer);
      producerOwners[producer.id] = peer.userId;

      callback({
        id: producer.id,
        source: producer.appData.source,
      });

      const roomId = users[peer.userId].roomId as string;
      socket.to(roomId).emit("newProducer", {
        producerId: producer.id,
        source: producer.appData.source,
      });
    });

    socket.on("getProducers", (callback) => {
      const producers = [];
      for (const [peerId, peer] of Object.entries(peers)) {
        if (peerId !== socket.id) {
          for (const producer of peer.producers) {
            producers.push({
              producerId: producer.id,
              source: producer.appData.source,
            });
          }
        }
      }
      callback(producers);
    });

    socket.on("createRecvTransport", async (callback) => {
      const peer = peers[socket.id];
      if (!peer) return callback();
      const transport = await createTransport();
      peer.recvTransports[transport.id] = transport;
      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    });

    socket.on(
      "connectRecvTransport",
      async ({ transportId, dtlsParameters }, callback) => {
        const peer = peers[socket.id];
        if (!peer) return callback();
        const transport = peer.recvTransports[transportId];
        if (!transport) return callback();
        await transport.connect({ dtlsParameters });
        callback();
      },
    );

    socket.on(
      "consume",
      async ({ producerId, transportId, rtpCapabilities }, callback) => {
        const peer = peers[socket.id];
        if (!peer) return callback(null);
        const transport = peer.recvTransports[transportId];
        if (!transport) return callback(null);
        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: true,
        });

        peer.consumers.push(consumer);

        callback({
          id: consumer.id,
          producerId: consumer.producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          producerUserId: producerOwners[producerId],
        });
      },
    );

    socket.on("resumeConsumer", async ({ consumerId }, callBack) => {
      const peer = peers[socket.id];
      if (!peer) return callBack();
      const consumer = peer.consumers.find((c) => c.id === consumerId);
      if (!consumer) {
        console.log("Consumer not found");
        return;
      }
      await consumer.resume();
      console.log("Consumer resumed:", consumerId);
      callBack();
    });

    socket.on("pauseProducer", async ({ producerId }, callback) => {
      const peer = peers[socket.id];
      if (!peer) return callback();
      const producer = peer?.producers.find((p) => p.id === producerId);
      if (producer) {
        await producer.pause();
        if (producer.kind === "audio") {
          users[peer.userId].mic = false;
        } else {
          users[peer.userId].camera = false;
        }
        const roomId = users[peer.userId].roomId as string;
        socket.to(roomId).emit("producerStateChanged", {
          userId: peer.userId,
          kind: producer.kind,
          paused: true,
        });
      }
      callback();
    });

    socket.on("resumeProducer", async ({ producerId }, callback) => {
      const peer = peers[socket.id];
      if (!peer) return callback();
      const producer = peer?.producers.find((p) => p.id === producerId);
      if (producer) {
        await producer.resume();
        if (producer.kind === "audio") {
          users[peer.userId].mic = true;
        } else {
          users[peer.userId].camera = true;
        }
        const roomId = users[peer.userId].roomId as string;
        socket.to(roomId).emit("producerStateChanged", {
          userId: peer.userId,
          kind: producer.kind,
          paused: false,
        });
      }
      callback();
    });

    socket.on("closeProducer", ({ producerId }, callback) => {
      const peer = peers[socket.id];
      if (!peer) return callback();
      const producer = peer.producers.find((p) => p.id === producerId);
      if (!producer) return callback();

      const source = producer.appData.source;
      const userId = peer.userId;

      if (source == "screen") {
        users[userId].screenSharing = false;
      } else {
        users[userId].camera = false;
        users[userId].mic = false;
      }

      const index = peer.producers.findIndex((p) => p.id === producerId);
      if (index !== -1) peer.producers.splice(index, 1);

      delete producerOwners[producer.id];
      const roomId = users[userId]?.roomId;
      if (roomId) {
        socket.to(roomId).emit("producerClosed", {
          producerId: producer.id,
          source,
          userId,
        });
      }
      callback();
    });

    socket.on("sendMessage", (message, userId) => {
      const user = users[userId];
      if (!user) return; 
      const roomId = user.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("videoChat User Disconnected :- ", socket.id);
      const peer = peers[socket.id];
      if (!peer) return;
      const userId = peer.userId;
      const user = users[userId];
      if (!user) {
        delete peers[socket.id];
        return;
      }
      console.log(userId);
      if (!userId) return;
      const RoomId: string = users[userId].roomId as string;
      const userIndex = rooms[RoomId]?.userId?.findIndex(
        (id: string) => id === userId,
      );
      socket.leave(RoomId);
      if (RoomId && rooms[RoomId] && userIndex !== -1 && userIndex !== undefined) {
        rooms[RoomId].userId.splice(userIndex, 1);
        rooms[RoomId].userNo -= 1;
      }
      const userName = users[userId].name;
      delete users[userId];
      let ProducerIds = [];
      for (const producer of peer.producers) {
        const source = producer.appData.source;
        producer.close();
        ProducerIds.push(producer.id);
        delete producerOwners[producer.id];
        if (RoomId) {
          socket.to(RoomId).emit("producerClosed", {
            producerId: producer.id,
            source,
            userId,
          });
        }
      }
      peer.producers = [];
      socket.to(RoomId).emit("userLeft", userId, ProducerIds, userName);
      for (const consumer of peer.consumers) {
        consumer.close();
      }
      peer.consumers = [];
      peer.sendTransport?.close();
      for (const transport of Object.values(peer.recvTransports)) {
        transport.close();
      }
      socket.leave(RoomId);
    });
  });
}
