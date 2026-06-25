import mongoose from "mongoose";
import connectDB from "@/lib/dbConnection";
import chat from "@/models/chat";
import user from "@/models/user";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { userId, userName, userPicture, addUserId } = await req.json();
    console.log({ userId, userName, addUserId });
    let userCheck;
    try {
      userCheck = await user.findById(addUserId, {
        _id: 1,
        name: 1,
        picture: 1,
      });
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: "wrong Input",
      });
    }
    console.log(userCheck);
    if (!userCheck)
      return NextResponse.json({
        success: false,
        message: "User not found",
      });

    const chatData = await chat.create({
      users: [
        { name: userName, userId: new mongoose.Types.ObjectId(userId) },
        {
          name: userCheck.name,
          userId: new mongoose.Types.ObjectId(addUserId),
        },
      ],
      lastMessage: "",
      lastMessageAt: new Date(0),
    });

    console.log(chatData);

    await user.findByIdAndUpdate(userId, {
      $inc: { contactNo: 1 },
      $push: {
        contacts: {
          name: userCheck.name,
          userId: new mongoose.Types.ObjectId(addUserId),
        },
        chats: {
          name: [userCheck.name],
          UserId: [new mongoose.Types.ObjectId(addUserId)],
          isGroup: false,
          chatId: new mongoose.Types.ObjectId(chatData._id),
          unreadCount: 0,
          preview: "New Contact",
          picture: userCheck.picture,
        },
      },
    });

    const addUserData = await user.findByIdAndUpdate(
      addUserId,
      {
        $inc: { contactNo: 1 },
        $push: {
          contacts: {
            name: userName,
            userId: new mongoose.Types.ObjectId(userId),
          },
          chats: {
            name: [userName],
            UserId: [new mongoose.Types.ObjectId(userId)],
            isGroup: false,
            chatId: new mongoose.Types.ObjectId(chatData._id),
            unreadCount: 0,
            preview: "New Contact",
            picture: userPicture,
          },
        },
      },
      {
        new: true,
        projection: {
          picture: 1,
        },
      },
    );

    return NextResponse.json({
      success: true,
      userData: {
        addContact: {
          name: userCheck.name,
          userId: addUserId,
        },
        addChats: {
          name: userCheck.name,
          UserId: addUserId,
          isGroup: false,
          chatId: chatData._id,
          unreadCount: 0,
          preview: "New Contact",
          picture: userCheck.picture,
        },
      },
      addUserId, 
      addedUserData: {
        addContact: {
          name: userName,
          userId: userId,
        },
        addChats: {
          name: userName,
          UserId: userId,
          isGroup: false,
          chatId: chatData._id,
          unreadCount: 0,
          preview: "New Contact",
          picture: userPicture,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
