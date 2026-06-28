import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnection";
import mongoose from "mongoose";
import user from "@/models/user";
import { ObjectId } from "mongodb";

interface Contacts {
  name: string;
  userId: ObjectId;
  picture: string;
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
      contacts: searchUser.toObject().contacts as Contacts[],
      chats: searchUser.toObject().chats as Chats[],
    };

    for (let i = 0; i < result.chats.length; i++) {
      console.log(result.chats[i]);
      let chatUser;
      result.chats[i]["name"] = [];
      result.chats[i]["email"] = [];
      for (let j = 0; j < result.chats[i].UserId.length; j++) {
        chatUser = await mongoose.models.user
          .findById(result.chats[i].UserId[j])
          .select(" name email picture ")
          .lean();
        result.chats[i]["name"].push(chatUser.name);
        result.chats[i]["email"].push(chatUser.email);
        result.chats[i]["picture"] = chatUser.picture;
      }
      console.log(chatUser);
      console.log(result.chats[i]);
    }

    for (let i = 0; i < result.contacts.length; i++) {
      const contact = await mongoose.models.user
        .findById(result.contacts[i].userId)
        .select("picture")
        .lean();
      result.contacts[i]["picture"] = contact?.picture;
    }

    console.log(result);

    return NextResponse.json(result);
  } else {
    return NextResponse.json({
      success: false,
    });
  }
}
