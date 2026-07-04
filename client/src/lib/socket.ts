
import { io } from "socket.io-client";

export const socket= io("http://localhost:5000",{
    autoConnect: false,
});

export const videoChatSocket= io("http://localhost:5000/videoChat",{
    autoConnect: false,
});