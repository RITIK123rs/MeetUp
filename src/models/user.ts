
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
    },
    picture:{
        type:String,
        required: true,
        default: "public/userPic.jpg"
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
            id: String,
            userId: ObjectId,
        }
    ],
    chat:[
        {
            name:[String],
            id: [String],
            preview: String,
            isGroup: Boolean,
            chatId: ObjectId,
            unreadCount: Number,
            lastMessageTime: {
                type: Date,
                default: Date.now,
            }
        }
    ]
})

const user=mongoose.model("user", userSchema );

export default user;
