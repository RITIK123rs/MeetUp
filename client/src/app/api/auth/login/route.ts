import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnection";
import mongoose from "mongoose";
import user from "@/models/user";
import { ObjectId } from "mongodb";

interface Contacts {
  name: string;
  userId: ObjectId;
}

interface Chats {
  name: string[];
  email: string[];
  picture: string;
  UserId: ObjectId[];
  preview: string;
  isGroup: boolean;
  chatId: ObjectId;
  unreadCount: number;
  lastMessageTime: Date;
}

interface UserResponse {
  success: boolean;
  id: ObjectId;
  name: string;
  email: string;
  picture: string;
  contactNo: number;
  groupNo: number;
  videoChatNo: number;
  contacts: Contacts[];
  chats: Chats[];
}

export async function GET(req: NextRequest) {
  const searchParam = req.nextUrl.searchParams;
  const email = searchParam.get("email");
  const password = searchParam.get("password");

  console.log(typeof email, typeof password);

  await connectDB();

  const searchUser = await user.findOne({ email: email });

  console.log(searchUser);

  if (searchUser && searchUser.password == password) {
    let result: UserResponse = {
      success: true,
      id: searchUser._id,
      name: searchUser.name,
      email: searchUser.email,
      picture: searchUser.picture,
      contactNo: searchUser.contactNo,
      groupNo: searchUser.groupNo,
      videoChatNo: searchUser.videoChatNo,
      contacts: searchUser.contacts as Contacts[],
      chats: searchUser.toObject().chats as Chats[],
    };

    for (let i = 0; i < result.chats.length; i++) {
      console.log(result.chats[i]);
      const chatUser = await mongoose.models.user
        .findById(result.chats[i].UserId[0])
        .select(" name email picture ").lean();

      console.log(chatUser);

      result.chats[i]["name"]=[chatUser.name];
      result.chats[i]["email"]=[chatUser.email];
      result.chats[i]["picture"] = chatUser.picture;
      
      console.log(result.chats[i]);
    }

    console.log(result);

    return NextResponse.json(result);
  } else {
    return NextResponse.json({
      success: false,
    });
  }
}
