console.log("DB Seeding");

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import chat from "../models/chat";
import user from "../models/user";

const MONGO_URI: string = process.env.MONGODB_URL!;

// ─── User IDs ─────────────────────────────────────────────────────────────────

const userIds = Array.from({ length: 5 }, () => new ObjectId());

// ─── Credentials ──────────────────────────────────────────────────────────────
//
//   person1@gmail.com   →  person123
//   person2@gmail.com   →  person246
//   person3@gmail.com   →  person369
//   person4@gmail.com   →  person4812
//   person5@gmail.com   →  person51015
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Chat IDs (declared early so users can reference them) ───────────────────

const groupChat1Id = new ObjectId();
const groupChat2Id = new ObjectId();
const p2pChat1Id = new ObjectId(); // Arjun ↔ Priya
const p2pChat2Id = new ObjectId(); // Arjun ↔ Rahul
const p2pChat3Id = new ObjectId(); // Priya ↔ Sneha
const p2pChat4Id = new ObjectId(); // Rahul ↔ Aisha

// ─── Last-message metadata ────────────────────────────────────────────────────

const groupChat1LastMsg = "See you all at 6 PM!";
const groupChat1LastMsgAt = new Date(Date.now() - 10 * 60_000);

const groupChat2LastMsg = "PR is up, please review when you get a chance.";
const groupChat2LastMsgAt = new Date(Date.now() - 5 * 60_000);

const p2pChat1LastMsg = "Sure, talk tomorrow then!";
const p2pChat1LastMsgAt = new Date(Date.now() - 20 * 60_000);

const p2pChat2LastMsg = "Yeah let's hop on a quick call.";
const p2pChat2LastMsgAt = new Date(Date.now() - 15 * 60_000);

const p2pChat3LastMsg = "Absolutely! Can't wait 😊";
const p2pChat3LastMsgAt = new Date(Date.now() - 35 * 60_000);

const p2pChat4LastMsg = "Done! Just pushed the fix.";
const p2pChat4LastMsgAt = new Date(Date.now() - 8 * 60_000);

// ─── Chat-entry builder (matches chat[] sub-doc in userSchema) ────────────────
//   Fields used: name:[String], UserId:[ObjectId], preview, isGroup,
//                chatId, unreadCount, lastMessageTime

function chatEntry(
  chatId: ObjectId,
  names: string[],
  userIdList: ObjectId[],
  preview: string,
  isGroup: boolean,
  unreadCount: number,
  lastMessageTime: Date,
) {
  return {
    name: names,
    UserId: userIdList, // capital-U matches the schema field
    preview,
    isGroup,
    chatId,
    unreadCount,
    lastMessageTime,
  };
}

// ─── Fake Users ───────────────────────────────────────────────────────────────
// contacts use { name, userId } only — no extra `id` string (not in schema)

const fakeUsers = [
  // ── Arjun ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[0],
    name: "Arjun Sharma",
    email: "person1@gmail.com",
    password: "person123",
    picture: "public/userPic.jpg",
    contactNo: 3,
    groupNo: 1,
    videoChatNo: 2,
    contacts: [
      { name: "Priya Mehta", userId: userIds[1] },
      { name: "Rahul Verma", userId: userIds[2] },
      { name: "Sneha Kapoor", userId: userIds[3] },
    ],
    chats: [
      chatEntry(
        groupChat1Id,
        ["Priya Mehta", "Sneha Kapoor"],
        [userIds[1], userIds[3]],
        groupChat1LastMsg,
        true,
        0,
        groupChat1LastMsgAt,
      ),
      chatEntry(
        groupChat2Id,
        ["Rahul Verma", "Aisha Khan"],
        [userIds[2], userIds[4]],
        groupChat2LastMsg,
        true,
        0,
        groupChat2LastMsgAt,
      ),
      chatEntry(
        p2pChat1Id,
        ["Priya Mehta"],
        [userIds[1]],
        p2pChat1LastMsg,
        false,
        0,
        p2pChat1LastMsgAt,
      ),
      chatEntry(
        p2pChat2Id,
        ["Rahul Verma"],
        [userIds[2]],
        p2pChat2LastMsg,
        false,
        0,
        p2pChat2LastMsgAt,
      ),
    ],
  },

  // ── Priya ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[1],
    name: "Priya Mehta",
    email: "person2@gmail.com",
    password: "person246",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [
      { name: "Arjun Sharma", userId: userIds[0] },
      { name: "Sneha Kapoor", userId: userIds[3] },
    ],
    chats: [
      chatEntry(
        groupChat1Id,
        ["Arjun Sharma", "Sneha Kapoor"],
        [userIds[0], userIds[3]],
        groupChat1LastMsg,
        true,
        2,
        groupChat1LastMsgAt,
      ),
      chatEntry(
        p2pChat1Id,
        ["Arjun Sharma"],
        [userIds[0]],
        p2pChat1LastMsg,
        false,
        1,
        p2pChat1LastMsgAt,
      ),
      chatEntry(
        p2pChat3Id,
        ["Sneha Kapoor"],
        [userIds[3]],
        p2pChat3LastMsg,
        false,
        0,
        p2pChat3LastMsgAt,
      ),
    ],
  },

  // ── Rahul ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[2],
    name: "Rahul Verma",
    email: "person3@gmail.com",
    password: "person369",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 0,
    contacts: [
      { name: "Arjun Sharma", userId: userIds[0] },
      { name: "Aisha Khan", userId: userIds[4] },
    ],
    chats: [
      chatEntry(
        groupChat2Id,
        ["Arjun Sharma", "Aisha Khan"],
        [userIds[0], userIds[4]],
        groupChat2LastMsg,
        true,
        1,
        groupChat2LastMsgAt,
      ),
      chatEntry(
        p2pChat2Id,
        ["Arjun Sharma"],
        [userIds[0]],
        p2pChat2LastMsg,
        false,
        2,
        p2pChat2LastMsgAt,
      ),
      chatEntry(
        p2pChat4Id,
        ["Aisha Khan"],
        [userIds[4]],
        p2pChat4LastMsg,
        false,
        0,
        p2pChat4LastMsgAt,
      ),
    ],
  },

  // ── Sneha ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[3],
    name: "Sneha Kapoor",
    email: "person4@gmail.com",
    password: "person4812",
    picture: "public/userPic.jpg",
    contactNo: 2,
    groupNo: 2,
    videoChatNo: 3,
    contacts: [
      { name: "Arjun Sharma", userId: userIds[0] },
      { name: "Priya Mehta", userId: userIds[1] },
    ],
    chats: [
      chatEntry(
        groupChat1Id,
        ["Arjun Sharma", "Priya Mehta"],
        [userIds[0], userIds[1]],
        groupChat1LastMsg,
        true,
        0,
        groupChat1LastMsgAt,
      ),
      chatEntry(
        p2pChat3Id,
        ["Priya Mehta"],
        [userIds[1]],
        p2pChat3LastMsg,
        false,
        1,
        p2pChat3LastMsgAt,
      ),
    ],
  },

  // ── Aisha ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[4],
    name: "Aisha Khan",
    email: "person5@gmail.com",
    password: "person51015",
    picture: "public/userPic.jpg",
    contactNo: 1,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [{ name: "Rahul Verma", userId: userIds[2] }],
    chats: [
      chatEntry(
        groupChat2Id,
        ["Arjun Sharma", "Rahul Verma"],
        [userIds[0], userIds[2]],
        groupChat2LastMsg,
        true,
        3,
        groupChat2LastMsgAt,
      ),
      chatEntry(
        p2pChat4Id,
        ["Rahul Verma"],
        [userIds[2]],
        p2pChat4LastMsg,
        false,
        1,
        p2pChat4LastMsgAt,
      ),
    ],
  },
];

// ─── Helper: build a messageGroup ────────────────────────────────────────────

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

// ─── Group Chat 1: "Weekend Plans 🏕️"  (Arjun, Priya, Sneha) ────────────────

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
      { sender: userIds[3], text: groupChat1LastMsg, minsAgo: 10 },
    ]),
  ],
};

// ─── Group Chat 2: "Dev Team 💻"  (Arjun, Rahul, Aisha) ─────────────────────

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
      { sender: userIds[0], text: groupChat2LastMsg, minsAgo: 5 },
    ]),
  ],
};

// ─── P2P Chat 1: Arjun ↔ Priya ───────────────────────────────────────────────

const p2pChat1 = {
  _id: p2pChat1Id,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Priya Mehta", userId: userIds[1] },
  ],
  lastMessageAt: p2pChat1LastMsgAt,
  lastMessage: p2pChat1LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[1],
        text: "Hey Arjun! Did you finish the report?",
        minsAgo: 90,
      },
      {
        sender: userIds[0],
        text: "Almost done, just polishing the last section.",
        minsAgo: 85,
      },
      {
        sender: userIds[1],
        text: "No rush, deadline is tomorrow evening.",
        minsAgo: 80,
      },
      {
        sender: userIds[0],
        text: "Perfect. Want to review it together over a call?",
        minsAgo: 45,
      },
      {
        sender: userIds[1],
        text: "I'm a bit tied up right now actually.",
        minsAgo: 30,
      },
      { sender: userIds[0], text: p2pChat1LastMsg, minsAgo: 20 },
    ]),
  ],
};

// ─── P2P Chat 2: Arjun ↔ Rahul ───────────────────────────────────────────────

const p2pChat2 = {
  _id: p2pChat2Id,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Rahul Verma", userId: userIds[2] },
  ],
  lastMessageAt: p2pChat2LastMsgAt,
  lastMessage: p2pChat2LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[0],
        text: "Rahul, did you see the bug in the login flow?",
        minsAgo: 100,
      },
      {
        sender: userIds[2],
        text: "Yeah I noticed it this morning. It's a session timeout issue.",
        minsAgo: 95,
      },
      {
        sender: userIds[0],
        text: "I was thinking we fix it before the sprint ends.",
        minsAgo: 70,
      },
      {
        sender: userIds[2],
        text: "Agreed. I can start on it after lunch.",
        minsAgo: 60,
      },
      {
        sender: userIds[0],
        text: "Should we sync on the approach first?",
        minsAgo: 25,
      },
      { sender: userIds[2], text: p2pChat2LastMsg, minsAgo: 15 },
    ]),
  ],
};

// ─── P2P Chat 3: Priya ↔ Sneha ───────────────────────────────────────────────

const p2pChat3 = {
  _id: p2pChat3Id,
  users: [
    { name: "Priya Mehta", userId: userIds[1] },
    { name: "Sneha Kapoor", userId: userIds[3] },
  ],
  lastMessageAt: p2pChat3LastMsgAt,
  lastMessage: p2pChat3LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[3],
        text: "Priya! Are you coming to Nisha's party on Friday?",
        minsAgo: 120,
      },
      {
        sender: userIds[1],
        text: "Of course! I already got her a gift 🎁",
        minsAgo: 110,
      },
      {
        sender: userIds[3],
        text: "Haha you're always so prepared.",
        minsAgo: 100,
      },
      {
        sender: userIds[1],
        text: "We should carpool, saves the hassle of parking.",
        minsAgo: 70,
      },
      {
        sender: userIds[3],
        text: "Great idea! I'll pick you up at 7?",
        minsAgo: 50,
      },
      { sender: userIds[1], text: p2pChat3LastMsg, minsAgo: 35 },
    ]),
  ],
};

// ─── P2P Chat 4: Rahul ↔ Aisha ───────────────────────────────────────────────

const p2pChat4 = {
  _id: p2pChat4Id,
  users: [
    { name: "Rahul Verma", userId: userIds[2] },
    { name: "Aisha Khan", userId: userIds[4] },
  ],
  lastMessageAt: p2pChat4LastMsgAt,
  lastMessage: p2pChat4LastMsg,
  messageGroups: [
    makeMessageGroup([
      {
        sender: userIds[4],
        text: "Rahul, the token refresh endpoint is returning a 500.",
        minsAgo: 80,
      },
      { sender: userIds[2], text: "Hmm, let me check the logs.", minsAgo: 75 },
      {
        sender: userIds[2],
        text: "Found it — there's a null dereference in the middleware.",
        minsAgo: 60,
      },
      {
        sender: userIds[4],
        text: "Oh that explains it. Can you patch it?",
        minsAgo: 45,
      },
      {
        sender: userIds[2],
        text: "Already on it, give me 10 mins.",
        minsAgo: 20,
      },
      { sender: userIds[2], text: p2pChat4LastMsg, minsAgo: 8 },
    ]),
  ],
};

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await user.deleteMany({});
    await chat.deleteMany({});
    console.log("🧹 Cleared existing users and chats");

    await chat.insertMany([
      groupChat1,
      groupChat2,
      p2pChat1,
      p2pChat2,
      p2pChat3,
      p2pChat4,
    ]);
    console.log("💬 Inserted 2 group chats + 4 P2P chats");

    await user.insertMany(fakeUsers);
    console.log("👤 Inserted 5 users");

    console.log("\n─── Seeded IDs ───────────────────────────────────");
    fakeUsers.forEach((u) => console.log(`  ${u.name.padEnd(18)} → ${u._id}`));
    console.log(
      `  ${"Group Chat 1".padEnd(18)} → ${groupChat1Id}  (Weekend Plans 🏕️)`,
    );
    console.log(
      `  ${"Group Chat 2".padEnd(18)} → ${groupChat2Id}  (Dev Team 💻)`,
    );
    console.log(`  ${"P2P: Arjun↔Priya".padEnd(18)} → ${p2pChat1Id}`);
    console.log(`  ${"P2P: Arjun↔Rahul".padEnd(18)} → ${p2pChat2Id}`);
    console.log(`  ${"P2P: Priya↔Sneha".padEnd(18)} → ${p2pChat3Id}`);
    console.log(`  ${"P2P: Rahul↔Aisha".padEnd(18)} → ${p2pChat4Id}`);
    console.log("──────────────────────────────────────────────────\n");

    console.log("─── Login Credentials ────────────────────────────");
    fakeUsers.forEach((u) =>
      console.log(`  ${u.email.padEnd(24)} →  ${u.password}`),
    );
    console.log("──────────────────────────────────────────────────\n");

    console.log("🌱 Seeding complete!");

    console.log("Users :- ");
    console.log(await user.find());
    console.log("Chats :- ");
    console.log(await chat.find());
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
