import { Namespace } from "socket.io";

interface Users {
  [userId: string]: {
    socketId: string;
    name: string | undefined;
    pic: string | undefined;
    roomId: string | undefined;
    mic: "on" | "off";
    camera: "on" | "off";
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

let rooms: Rooms = {};
let users: Users = {};

export default function initializeVideoCallSocket(videoChat: Namespace) {
  videoChat.on("connection", (socket) => {
    console.log("video Call User Connected :- ", socket.id, { rooms, users });

    socket.on("CheckNewGenID", (id, callback) => {
      if (id in rooms) callback(false);
      else callback(true);
    });

    socket.on("createRoom", (roomId, roomName, id, user) => {
      users[id] = user;
      rooms[roomId] = {
        roomName,
        userNo: 1,
        userId: [id],
        createdBy: id,
      };
      socket.join(roomId);
      console.log({ users, rooms },rooms[roomId].userId);
      console.log(socket.id, " create Room :- ", roomId);
    });

    socket.on("joinRoom", (roomId, id, user, callback) => {
      const room = rooms[roomId];
      if (!room) {
        callback(false)
        return;
      }
      users[id] = user;
      rooms[roomId].userId.push(id);
      rooms[roomId].userNo += 1;
      const roomInfo = rooms[roomId];
      let joinUser: Users = {};
      roomInfo.userId.forEach((Id) => {
        joinUser[Id] = users[Id];
      });
      console.log({ joinUser });
      socket.join(roomId);
      console.log({ users, rooms, joinUser },rooms[roomId].userId);
      console.log(socket.id, " joined :- ", roomId);
      callback(
        true,
        roomInfo.roomName,
        roomInfo.createdBy,
        joinUser,
        roomInfo.userNo,
      );
    });

    socket.on("disconnect", () => {
      console.log("videoChat User Disconnected :- ", socket.id);
      const userId: string = Object.keys(users).find(
        (id) => users[id].socketId == socket.id,
      ) as string;
      console.log(userId);
      if (!userId) return;
        const RoomId: string = users[userId].roomId as string;
        const userIndex = rooms[RoomId]?.userId?.findIndex(
          (id: string) => id === userId,
        );
        socket.leave(RoomId);
        if (userIndex !== -1){
          rooms[RoomId].userId.splice(userIndex, 1);
          rooms[RoomId].userNo -=1;
        } 
        delete users[userId];
    });
  });
}
