
import { Server } from "socket.io";

export default function initializeSocket(io: Server) {
  io.use((socket, next) => {
    console.log("A user is trying to connect");
    next(); 
  });

  io.on("connection", (socket) => {
    console.log("User Connected : ", socket.id);
  });
}
