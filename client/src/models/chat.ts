import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: [
    {
      name: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
  ],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  lastMessage: String,
  messageGroups: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      chats: [
        {
          sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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

const chat = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chat;
