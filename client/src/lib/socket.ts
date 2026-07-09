
import { io } from "socket.io-client";

const server_url = process.env.SERVER_URL!;

export const socket = io(server_url, {
    autoConnect: false,
});

export const videoChatSocket = io(`${server_url}/videoChat`, {
    autoConnect: false,
});