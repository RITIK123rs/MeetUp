import express from "express";
import mongoose from "mongoose";
import chat from "@/models/chat";
import user from "@/models/user";

const router = express.Router();

interface ChatData {
  name: string[];
  UserId: string[];
  preview: string;
  groupName: string;
  isGroup: boolean;
  chatId: mongoose.Types.ObjectId;
  unreadCount: number;
  lastMessageTime: Date;
}

type Chats = {
    [key: string]: ChatData;
};


router.post("/", async (req, res) => {
  try {
    const { groupName, users } = req.body;
    console.log({ groupName, users });
    const newChat = await chat.create({
      users,
      isGroup: true,
      groupName,
      lastMessage: "New Group",
      lastMessageAt: new Date(0).toISOString(),
      messageGroups: new Array(),
    });
    const chatId = newChat._id;

    let chats:Chats={};

    for (const userData of users) {
      const usersId: string[] = [];
      const usersName: string[] = [];

      for (const data of users) {
        if (userData.userId !== data.userId) {
          usersId.push(data.userId);
          usersName.push(data.name);
        }
      }

      console.log({ usersId, usersName });

      const chat:ChatData = {
        name: usersName,
        UserId: usersId,
        preview: "New Group",
        groupName,
        isGroup: true,
        chatId: new mongoose.Types.ObjectId(chatId),
        unreadCount: 0,
        lastMessageTime: new Date(0),
      };

      chats[userData.userId]=chat;

      await user.findByIdAndUpdate(userData.userId, {
        $inc: {
          groupNo: 1,
        },
        $push: {
          chats: chat,
        },
      });
    }

    console.log("chats :- ",chats);

    res.status(201).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export default router;
