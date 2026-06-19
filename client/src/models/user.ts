
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,
    },
    picture:{
        type:String,
        default: "userPic.jpg"
    },
    contactNo: {
        type: Number,
        default: 0,
    },
    groupNo: {
        type: Number,
        default: 0,
    },
    videoChatNo: {
        type: Number,
        default: 0,
    },
    contacts:[
        {
            name: String,
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        }
    ],
    chats:[
        {
            name:[String],
            UserId: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
            preview: String,
            isGroup: Boolean,
            chatId: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
            unreadCount:  { type: Number, default: 0 },
            lastMessageTime: {
                type: Date,
                default: Date.now,
            }
        }
    ]
})

const user=mongoose.models.user || mongoose.model("user", userSchema );

export default user;
