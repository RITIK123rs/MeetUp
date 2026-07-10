
import { io } from "socket.io-client";

const server_url = process.env.NEXT_PUBLIC_SERVER_URL!;

console.log("Server URL :- ",server_url);

export const socket = io(server_url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
});

export const videoChatSocket = io(`${server_url}/videoChat`, {
    autoConnect: false,
    transports: ["websocket", "polling"],
});