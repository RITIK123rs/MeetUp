import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { Server } from "socket.io";
import http from "http";
import initializeSocket from "./socket/socket";
import initializeVideoCallSocket from "./videoChat/socket";
import newGroupRouter from "./handler/newGroup";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "*";

app.use(cors({
    origin: CLIENT_URL,
}));
app.use(express.json());
app.use("/newGroupAdd", newGroupRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
    }
});

initializeSocket(io);
const videoChat = io.of("/videoChat");
initializeVideoCallSocket(videoChat);

app.get("/health", (req, res) => {
    console.log("Server is Running Successfully")
    res.json("Server is Running Successfully");
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});