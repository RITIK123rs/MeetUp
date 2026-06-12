import { NextResponse, NextRequest } from "next/server";
import user from "@/models/user";
import connectDB from "@/lib/dbConnection";
import { ObjectId } from "mongodb";

interface Contacts {
  name: string;
  userId: ObjectId;
}

interface Chats {
  name: string[];
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

export async function POST(req: NextRequest) {
  console.log("Google auth");
  try {
    const { token } = await req.json();
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const userData = await response.json();
    console.log(userData);

    await connectDB();

    const searchUser = await user.findOne({ email: userData.email });

    console.log(searchUser);

    let result: UserResponse;

    if (!searchUser) {
      const fetchData = await user.create({
        name: userData.name,
        password: process.env.GOOGLE_LOGIN_PASSWORD,
        email: userData.email,
        picture: userData.picture,
      });

      result = {
        success: true,
        id: fetchData._id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        contactNo: 0,
        groupNo: 0,
        videoChatNo: 0,
        contacts: [],
        chats: [],
      };
    } else {
      result = {
        success: true,
        id: searchUser._id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        contactNo: searchUser.contactNo,
        groupNo: searchUser.groupNo,
        videoChatNo: searchUser.videoChatNo,
        contacts: searchUser.contacts as Contacts[],
        chats: searchUser.chats as Chats[],
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      success: false,
    });
  }
}
