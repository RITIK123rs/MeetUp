import mongoose from "mongoose";
import connectDB from "@/lib/dbConnection";
import chat from "@/models/chat";
import user from "@/models/user";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  await connectDB();

  try {
    const { chatId } = await params;
    await connectDB();
    const searchChat = await chat.findById(chatId).lean();
    console.log(searchChat);

    if (!searchChat) {
      return NextResponse.json({
        success: false,
        message: "Chat not found",
      });
    }

    for (const [index, data] of searchChat.users.entries()) {
      const chatUser = await user
        .findById(data.userId)
        .select("picture")
        .lean();

      searchChat.users[index].picture = chatUser?.picture;
    }

    console.log("search chat :- ", searchChat);

    return NextResponse.json({
      success: true,
      data: searchChat,
    });
  } catch {
    return NextResponse.json({
      success: false,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  await connectDB();

  try {
    const { chatId } = await params;
    const { userId } = await req.json();

    console.log(chatId, userId);

    const updatedData = await user
      .findOneAndUpdate(
        {
          _id: userId,
          "chats.chatId": new mongoose.Types.ObjectId(chatId),
        },
        { $set: { "chats.$.unreadCount": 0 } },
        { new: true },
      )
      .lean();

    console.log(updatedData);

    for (let i = 0; i < updatedData.chats.length; i++) {
      // console.log(updatedData.chats[i]);
      const chatUser = await user
        .findById(updatedData.chats[i].UserId)
        .select(" name email picture ")
        .lean();
      // console.log(chatUser);
      updatedData.chats[i]["name"] = [chatUser.name];
      updatedData.chats[i]["email"] = [chatUser.email];
      updatedData.chats[i]["picture"] = chatUser.picture;
    }

    console.log(updatedData.chats);
    return NextResponse.json({
      success: true,
      chats: updatedData.chats,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      success: false,
    });
  }
}
