
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { Server } from "socket.io";
import http from "http";
import initializeSocket from "./socket/socket";
import newGroupRouter from "./handler/newGroup";

connectDB();

const app=express();
app.use(cors());
app.use(express.json());
app.use("/newGroupAdd",newGroupRouter);

const server=http.createServer(app);
const io= new Server(server,{
    cors:{
        origin: "*",
    }
})

initializeSocket(io);

app.get("/health",(req,res)=>{
    res.json("Server is Running Successfully")
})

server.listen(5000,()=>{
    console.log("http://localhost:5000")
})