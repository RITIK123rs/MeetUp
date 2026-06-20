import { Server } from "socket.io";
import { addMessage } from "./handlers/dbMessage";

interface ActiveUser {
  [userId: string]: {
    socketId: string;
    name: string | undefined;
    email: string | undefined;
  };
}

let activeUser: ActiveUser = {};

export default function initializeSocket(io: Server) {
  io.use((socket, next) => {
    console.log("A user is trying to connect");
    const { id, name, email } = socket.handshake.auth;
    console.log(id, name, email);

    if (!id) return next(new Error("No user ID"));

    activeUser[id as string] = {
      socketId: socket.id,
      name: name as string,
      email: email as string,
    };
    next();
  });

  io.on("connection", (socket) => {
    console.log("User Connected : ", socket.id);
    console.log(activeUser);

    socket.on("newMessage-new", ({ userList, chatId, data, sendMessage }) => {
      console.log(userList, chatId, data, sendMessage);
      addMessage("new", chatId, data);
      for (const userId of userList) {
        console.log(
          "send message to other : ",
          userId.socketId,
          chatId,
          sendMessage,
        );
        io.to(userId.socketId).emit("newMessage", { chatId, sendMessage });
      }
    });
    socket.on(
      "newMessage-existing",
      ({ userList,senderId, chatId, data, sendMessage }) => {
        console.log(userList, chatId, data, sendMessage);
        addMessage("existing", chatId, data);
        for (const userId of userList) {
          if (userId in activeUser) {
            const socketId = activeUser[userId].socketId;
            console.log(
              "send message to other : ",
              socketId,
              chatId,
              sendMessage,
            );
            io.to(socketId).emit("newMessage", {chatId,senderId,message: sendMessage});
          }else{
            console.log("user not found")
          }
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("user Disconnected : ", socket.id);
      const userId: string = Object.keys(activeUser).find(
        (id) => activeUser[id].socketId == socket.id,
      ) as string;
      delete activeUser[userId];
    });
  });
}
