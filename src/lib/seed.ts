console.log("DB Seeding");

import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import chat from "../models/chat"; // adjust path as needed
import user from "../models/user"; // adjust path as needed

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name";

// ─── Fake User Data ───────────────────────────────────────────────────────────

const userIds = Array.from({ length: 5 }, () => new ObjectId());

const fakeUsers = [
  {
    _id: userIds[0],
    name: "Arjun Sharma",
    email: "arjun.sharma@example.com",
    picture: "public/userPic.jpg",
    contactNo: 3,
    groupNo: 1,
    videoChatNo: 2,
    contacts: [
      { name: "Priya Mehta", id: userIds[1].toString(), userId: userIds[1] },
      { name: "Rahul Verma", id: userIds[2].toString(), userId: userIds[2] },
      { name: "Sneha Kapoor", id: userIds[3].toString(), userId: userIds[3] },
    ],
    chat: [], // filled after chats are created
  },
  {
    _id: userIds[1],
    name: "Priya Mehta",
    email: "priya.mehta@example.com",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [
      { name: "Arjun Sharma", id: userIds[0].toString(), userId: userIds[0] },
      { name: "Sneha Kapoor", id: userIds[3].toString(), userId: userIds[3] },
    ],
    chat: [],
  },
  {
    _id: userIds[2],
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 0,
    contacts: [
      { name: "Arjun Sharma", id: userIds[0].toString(), userId: userIds[0] },
      { name: "Aisha Khan", id: userIds[4].toString(), userId: userIds[4] },
    ],
    chat: [],
  },
  {
    _id: userIds[3],
    name: "Sneha Kapoor",
    email: "sneha.kapoor@example.com",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 2,
    videoChatNo: 3,
    contacts: [
      { name: "Arjun Sharma", id: userIds[0].toString(), userId: userIds[0] },
      { name: "Priya Mehta", id: userIds[1].toString(), userId: userIds[1] },
    ],
    chat: [],
  },
  {
    _id: userIds[4],
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    picture: "public/userPic.jpg",
    contactNo: 1,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [
      { name: "Rahul Verma", id: userIds[2].toString(), userId: userIds[2] },
    ],
    chat: [],
  },
];

// ─── Helper: build a messageGroup for today ───────────────────────────────────

function makeMessageGroup(
  messages: { sender: ObjectId; text: string; minsAgo: number }[],
) {
  const now = new Date();
  return {
    date: now,
    chats: messages.map(({ sender, text, minsAgo }) => ({
      sender,
      textMessage: true,
      text,
      createdAt: new Date(now.getTime() - minsAgo * 60_000),
    })),
  };
}

// ─── Group Chat 1: "Weekend Plans 🏕️" ────────────────────────────────────────
// Members: Arjun, Priya, Sneha

const groupChat1Id = new ObjectId();
const groupChat1LastMsg = "See you all at 6 PM!";
const groupChat1LastMsgAt = new Date(Date.now() - 10 * 60_000);

const groupChat1 = {
  _id: groupChat1Id,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Priya Mehta", userId: userIds[1] },
    { name: "Sneha Kapoor", userId: userIds[3] },
  ],
  lastMessageAt: groupChat1LastMsgAt,
  lastMessage: groupChat1LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[0],
        text: "Hey everyone! Plans for the weekend?",
        minsAgo: 60,
      },
      { sender: userIds[1], text: "I'm free Saturday evening!", minsAgo: 55 },
      {
        sender: userIds[3],
        text: "Same here. How about a bonfire?",
        minsAgo: 50,
      },
      {
        sender: userIds[0],
        text: "Love that idea 🔥 I'll bring snacks",
        minsAgo: 40,
      },
      { sender: userIds[1], text: "I'll handle the music 🎶", minsAgo: 30 },
      { sender: userIds[3], text: "See you all at 6 PM!", minsAgo: 10 },
    ]),
  ],
};

// ─── Group Chat 2: "Dev Team 💻" ──────────────────────────────────────────────
// Members: Arjun, Rahul, Aisha

const groupChat2Id = new ObjectId();
const groupChat2LastMsg = "PR is up, please review when you get a chance.";
const groupChat2LastMsgAt = new Date(Date.now() - 5 * 60_000);

const groupChat2 = {
  _id: groupChat2Id,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Rahul Verma", userId: userIds[2] },
    { name: "Aisha Khan", userId: userIds[4] },
  ],
  lastMessageAt: groupChat2LastMsgAt,
  lastMessage: groupChat2LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[2],
        text: "Morning team! Sprint review is at 3 PM today.",
        minsAgo: 120,
      },
      {
        sender: userIds[4],
        text: "Got it, I'll have the auth module ready by then.",
        minsAgo: 110,
      },
      {
        sender: userIds[0],
        text: "I pushed the DB migration scripts — check them out.",
        minsAgo: 90,
      },
      {
        sender: userIds[2],
        text: "Looks good Arjun, just one small comment on line 42.",
        minsAgo: 75,
      },
      {
        sender: userIds[4],
        text: "Also, can someone review the API rate-limiting PR?",
        minsAgo: 30,
      },
      {
        sender: userIds[0],
        text: "PR is up, please review when you get a chance.",
        minsAgo: 5,
      },
    ]),
  ],
};

// ─── Attach chats back to users ──────────────────────────────────────────────

const groupChat1Entry = (
  unreadCount: number,
  names: string[],
  ids: string[],
) => ({
  name: names,
  id: ids,
  preview: groupChat1LastMsg,
  isGroup: true,
  chatId: groupChat1Id,
  unreadCount,
  lastMessageTime: groupChat1LastMsgAt,
});

const groupChat2Entry = (
  unreadCount: number,
  names: string[],
  ids: string[],
) => ({
  name: names,
  id: ids,
  preview: groupChat2LastMsg,
  isGroup: true,
  chatId: groupChat2Id,
  unreadCount,
  lastMessageTime: groupChat2LastMsgAt,
});

// Arjun (member of both groups)
fakeUsers[0].chat = [
  groupChat1Entry(
    0,
    ["Priya Mehta", "Sneha Kapoor"],
    [userIds[1].toString(), userIds[3].toString()],
  ),
  groupChat2Entry(
    0,
    ["Rahul Verma", "Aisha Khan"],
    [userIds[2].toString(), userIds[4].toString()],
  ),
] as any;

// Priya (member of group 1)
fakeUsers[1].chat = [
  groupChat1Entry(
    2,
    ["Arjun Sharma", "Sneha Kapoor"],
    [userIds[0].toString(), userIds[3].toString()],
  ),
] as any;

// Rahul (member of group 2)
fakeUsers[2].chat = [
  groupChat2Entry(
    1,
    ["Arjun Sharma", "Aisha Khan"],
    [userIds[0].toString(), userIds[4].toString()],
  ),
] as any;

// Sneha (member of group 1)
fakeUsers[3].chat = [
  groupChat1Entry(
    0,
    ["Arjun Sharma", "Priya Mehta"],
    [userIds[0].toString(), userIds[1].toString()],
  ),
] as any;

// Aisha (member of group 2)
fakeUsers[4].chat = [
  groupChat2Entry(
    3,
    ["Arjun Sharma", "Rahul Verma"],
    [userIds[0].toString(), userIds[2].toString()],
  ),
] as any;

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await user.deleteMany({});
    await chat.deleteMany({});
    console.log("🧹 Cleared existing users and chats");

    // Insert chats first (so IDs exist)
    await chat.insertMany([groupChat1, groupChat2]);
    console.log("💬 Inserted 2 group chats");

    // Insert users
    await user.insertMany(fakeUsers);
    console.log("👤 Inserted 5 users");

    console.log("\n─── Seeded IDs ───────────────────────────────────");
    fakeUsers.forEach((u) => console.log(`  ${u.name.padEnd(18)} → ${u._id}`));
    console.log(
      `  ${"Group Chat 1".padEnd(18)} → ${groupChat1Id}  (Weekend Plans)`,
    );
    console.log(`  ${"Group Chat 2".padEnd(18)} → ${groupChat2Id}  (Dev Team)`);
    console.log("──────────────────────────────────────────────────\n");

    console.log("🌱 Seeding complete!");

    console.log("User :- ");
    console.log(await user.find());
    console.log("Chat :- ");
    console.log(await chat.find());
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
