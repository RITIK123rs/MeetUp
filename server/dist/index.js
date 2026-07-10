"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./socket/socket"));
const socket_2 = __importDefault(require("./videoChat/socket"));
const newGroup_1 = __importDefault(require("./handler/newGroup"));
(0, db_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "*";
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
}));
app.use(express_1.default.json());
app.use("/newGroupAdd", newGroup_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: CLIENT_URL,
    }
});
(0, socket_1.default)(io);
const videoChat = io.of("/videoChat");
(0, socket_2.default)(videoChat);
app.get("/health", (req, res) => {
    res.json("Server is Running Successfully");
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
