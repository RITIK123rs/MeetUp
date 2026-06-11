import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: [
    {
      name: String,
      userId: ObjectId,
    },
  ],
  lastMessageAt: Date,
  lastMessage: String,
  messageGroups: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      chats: [
        {
          sender: ObjectId,
          textMessage: Boolean,
          text: String,
          createdAt: {             
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
});

const chat = mongoose.model("chat", chatSchema);

export default chat;
