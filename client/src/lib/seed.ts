console.log("🌱 DB Seeding started...");

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import chat from "../models/chat";
import user from "../models/user";

const MONGO_URI: string = process.env.MONGODB_URL!;

// ─── Credentials ──────────────────────────────────────────────────────────────
//
//   person1@gmail.com   →  person123
//   person2@gmail.com   →  person246
//   person3@gmail.com   →  person369
//   person4@gmail.com   →  person4812
//   person5@gmail.com   →  person51015
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── User IDs ─────────────────────────────────────────────────────────────────

const userIds = Array.from({ length: 5 }, () => new ObjectId());
// userIds[0] → Arjun Sharma
// userIds[1] → Priya Mehta
// userIds[2] → Rahul Verma
// userIds[3] → Sneha Kapoor
// userIds[4] → Aisha Khan

// ─── Chat IDs ─────────────────────────────────────────────────────────────────

const groupChat1Id = new ObjectId(); // "Weekend Plans 🏕️"  — Arjun, Priya, Sneha
const groupChat2Id = new ObjectId(); // "Dev Team 💻"        — Arjun, Rahul, Aisha
const p2pChat1Id   = new ObjectId(); // Arjun  ↔ Priya
const p2pChat2Id   = new ObjectId(); // Arjun  ↔ Rahul
const p2pChat3Id   = new ObjectId(); // Priya  ↔ Sneha
const p2pChat4Id   = new ObjectId(); // Rahul  ↔ Aisha

// ─── Time helpers ─────────────────────────────────────────────────────────────

const now = new Date();
const daysAgo  = (d: number) => new Date(now.getTime() - d * 86_400_000);
const minsAgo  = (m: number) => new Date(now.getTime() - m * 60_000);

// ─── Last-message metadata ────────────────────────────────────────────────────

const groupChat1LastMsg   = "See you all at 6 PM! 🔥";
const groupChat1LastMsgAt = minsAgo(10);

const groupChat2LastMsg   = "PR is up — please review when you get a chance.";
const groupChat2LastMsgAt = minsAgo(5);

const p2pChat1LastMsg   = "Sure, talk tomorrow then!";
const p2pChat1LastMsgAt = minsAgo(20);

const p2pChat2LastMsg   = "Yeah let's hop on a quick call.";
const p2pChat2LastMsgAt = minsAgo(15);

const p2pChat3LastMsg   = "Absolutely! Can't wait 😊";
const p2pChat3LastMsgAt = minsAgo(35);

const p2pChat4LastMsg   = "Done! Just pushed the fix.";
const p2pChat4LastMsgAt = minsAgo(8);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a messageGroup at a given base date, with messages offset backwards. */
function makeMessageGroup(
  baseDate: Date,
  messages: { sender: ObjectId; text: string; minsAgo: number }[],
) {
  return {
    date: baseDate,
    chats: messages.map(({ sender, text, minsAgo: m }) => ({
      sender,
      textMessage: true,
      text,
      createdAt: new Date(baseDate.getTime() - m * 60_000),
    })),
  };
}

/** Builds a user.chats sub-document entry (matches the schema exactly). */
function chatEntry({
  chatId,
  names,
  userIdList,
  preview,
  isGroup,
  groupName,
  unreadCount,
  lastMessageTime,
}: {
  chatId: ObjectId;
  names: string[];
  userIdList: ObjectId[];
  preview: string;
  isGroup: boolean;
  groupName?: string;
  unreadCount: number;
  lastMessageTime: Date;
}) {
  return {
    name: names,
    UserId: userIdList,   // capital-U matches schema field
    preview,
    isGroup,
    ...(groupName ? { groupName } : {}),
    chatId,
    unreadCount,
    lastMessageTime,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHATS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Group Chat 1: "Weekend Plans 🏕️"  (Arjun, Priya, Sneha) ────────────────

const groupChat1 = {
  _id: groupChat1Id,
  isGroup: true,
  groupName: "Weekend Plans 🏕️",
  users: [
    { name: "Arjun Sharma",  userId: userIds[0] },
    { name: "Priya Mehta",   userId: userIds[1] },
    { name: "Sneha Kapoor",  userId: userIds[3] },
  ],
  lastMessageAt: groupChat1LastMsgAt,
  lastMessage:   groupChat1LastMsg,
  messageGroups: [
    // ── Day 1 (3 days ago) ──────────────────────────────────────────────────
    makeMessageGroup(daysAgo(3), [
      { sender: userIds[0], text: "Hey everyone! What are we doing this weekend?",          minsAgo: 300 },
      { sender: userIds[1], text: "Not sure yet. Any ideas?",                               minsAgo: 290 },
      { sender: userIds[3], text: "How about trekking? The weather looks great.",            minsAgo: 280 },
      { sender: userIds[0], text: "Ooh yes! Sanjay Gandhi National Park maybe?",             minsAgo: 270 },
      { sender: userIds[1], text: "I'm down! Haven't been there in ages.",                  minsAgo: 250 },
      { sender: userIds[3], text: "Let's plan for Saturday morning then. 7 AM start?",      minsAgo: 240 },
      { sender: userIds[0], text: "Perfect. I'll pack snacks 🎒",                            minsAgo: 220 },
      { sender: userIds[1], text: "I'll handle sunscreen and first aid lol",                minsAgo: 210 },
      { sender: userIds[3], text: "Haha we're so prepared. This is going to be fun!",       minsAgo: 200 },
    ]),
    // ── Day 2 (yesterday) ───────────────────────────────────────────────────
    makeMessageGroup(daysAgo(1), [
      { sender: userIds[1], text: "Quick update — Saturday trek got rained out 😢",         minsAgo: 180 },
      { sender: userIds[0], text: "Nooo! I was so excited.",                                minsAgo: 170 },
      { sender: userIds[3], text: "Same. How about a bonfire at my place instead?",         minsAgo: 160 },
      { sender: userIds[0], text: "Love that idea 🔥 I'll still bring the snacks!",         minsAgo: 140 },
      { sender: userIds[1], text: "And I'll handle the music 🎶",                           minsAgo: 130 },
      { sender: userIds[3], text: "Amazing. Let's say 6 PM?",                               minsAgo: 120 },
      { sender: userIds[0], text: "Works for me!",                                          minsAgo: 100 },
      { sender: userIds[1], text: "Same, can't wait.",                                      minsAgo: 90  },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[0], text: "Sneha, do we need to bring anything specific?",          minsAgo: 60 },
      { sender: userIds[3], text: "Just yourselves! I have everything covered 😄",          minsAgo: 45 },
      { sender: userIds[1], text: "Should we carpool from my place?",                       minsAgo: 30 },
      { sender: userIds[0], text: "Yes! Pick me up on the way?",                            minsAgo: 20 },
      { sender: userIds[1], text: "Of course. Leaving at 5:45.",                            minsAgo: 15 },
      { sender: userIds[3], text: groupChat1LastMsg,                                        minsAgo: 10 },
    ]),
  ],
};

// ─── Group Chat 2: "Dev Team 💻"  (Arjun, Rahul, Aisha) ─────────────────────

const groupChat2 = {
  _id: groupChat2Id,
  isGroup: true,
  groupName: "Dev Team 💻",
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Rahul Verma",  userId: userIds[2] },
    { name: "Aisha Khan",   userId: userIds[4] },
  ],
  lastMessageAt: groupChat2LastMsgAt,
  lastMessage:   groupChat2LastMsg,
  messageGroups: [
    // ── 2 days ago ──────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(2), [
      { sender: userIds[4], text: "Hey team, I've started the auth module refactor.",        minsAgo: 400 },
      { sender: userIds[2], text: "Nice! Are you using JWT or sessions?",                   minsAgo: 390 },
      { sender: userIds[4], text: "JWT with refresh token rotation. More scalable.",         minsAgo: 375 },
      { sender: userIds[0], text: "Good call. Make sure to handle token blacklisting.",      minsAgo: 360 },
      { sender: userIds[4], text: "Already on it. I'll open a PR by tomorrow.",             minsAgo: 340 },
      { sender: userIds[2], text: "I'll review it first thing in the morning 👍",           minsAgo: 320 },
      { sender: userIds[0], text: "Same. Also, sprint review is Friday at 3 PM.",           minsAgo: 300 },
      { sender: userIds[2], text: "Got it. I'll have the DB layer ready by then.",          minsAgo: 280 },
    ]),
    // ── Yesterday ───────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(1), [
      { sender: userIds[2], text: "Morning team! Aisha's PR looks really solid.",           minsAgo: 200 },
      { sender: userIds[4], text: "Thanks! Just waiting on final review comments.",         minsAgo: 190 },
      { sender: userIds[0], text: "I pushed the DB migration scripts — please check them.", minsAgo: 170 },
      { sender: userIds[2], text: "Looks good Arjun, just one comment on line 42.",         minsAgo: 150 },
      { sender: userIds[0], text: "Fixed! Pushed a follow-up commit.",                      minsAgo: 140 },
      { sender: userIds[4], text: "Can someone also review the rate-limiting PR?",          minsAgo: 120 },
      { sender: userIds[2], text: "On it after lunch.",                                     minsAgo: 110 },
      { sender: userIds[0], text: "I'll take a look too. Two sets of eyes never hurts.",   minsAgo: 100 },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[2], text: "Morning! Sprint review in a few hours.",                 minsAgo: 120 },
      { sender: userIds[4], text: "Auth module is done and tested ✅",                      minsAgo: 110 },
      { sender: userIds[0], text: "Great work Aisha! I'll demo the DB changes.",            minsAgo: 90  },
      { sender: userIds[2], text: "I'll cover the API layer. We're in good shape.",         minsAgo: 60  },
      { sender: userIds[4], text: "Also, can someone review the API rate-limiting PR?",     minsAgo: 30  },
      { sender: userIds[0], text: groupChat2LastMsg,                                        minsAgo: 5   },
    ]),
  ],
};

// ─── P2P Chat 1: Arjun ↔ Priya ───────────────────────────────────────────────

const p2pChat1 = {
  _id: p2pChat1Id,
  isGroup: false,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Priya Mehta",  userId: userIds[1] },
  ],
  lastMessageAt: p2pChat1LastMsgAt,
  lastMessage:   p2pChat1LastMsg,
  messageGroups: [
    // ── 2 days ago ──────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(2), [
      { sender: userIds[1], text: "Hey Arjun! How's the project coming along?",             minsAgo: 300 },
      { sender: userIds[0], text: "Slowly but surely 😅 The backend is almost done.",       minsAgo: 290 },
      { sender: userIds[1], text: "You always say almost done haha.",                       minsAgo: 280 },
      { sender: userIds[0], text: "This time I mean it! Promise.",                          minsAgo: 270 },
      { sender: userIds[1], text: "I'll believe it when I see it 😂",                       minsAgo: 250 },
      { sender: userIds[0], text: "Fair enough. How's your side going?",                    minsAgo: 240 },
      { sender: userIds[1], text: "UI is 80% done. Just polishing animations.",             minsAgo: 220 },
      { sender: userIds[0], text: "Sounds great! Let's sync tomorrow.",                     minsAgo: 200 },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[1], text: "Hey Arjun! Did you finish the report?",                  minsAgo: 90 },
      { sender: userIds[0], text: "Almost done, just polishing the last section.",          minsAgo: 85 },
      { sender: userIds[1], text: "No rush, deadline is tomorrow evening.",                 minsAgo: 80 },
      { sender: userIds[0], text: "Perfect. Want to review it together over a call?",       minsAgo: 45 },
      { sender: userIds[1], text: "I'm a bit tied up right now actually.",                  minsAgo: 30 },
      { sender: userIds[0], text: p2pChat1LastMsg,                                          minsAgo: 20 },
    ]),
  ],
};

// ─── P2P Chat 2: Arjun ↔ Rahul ───────────────────────────────────────────────

const p2pChat2 = {
  _id: p2pChat2Id,
  isGroup: false,
  users: [
    { name: "Arjun Sharma", userId: userIds[0] },
    { name: "Rahul Verma",  userId: userIds[2] },
  ],
  lastMessageAt: p2pChat2LastMsgAt,
  lastMessage:   p2pChat2LastMsg,
  messageGroups: [
    // ── Yesterday ───────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(1), [
      { sender: userIds[0], text: "Rahul, did you read the new system design doc?",         minsAgo: 300 },
      { sender: userIds[2], text: "Yeah! The microservices approach is smart.",             minsAgo: 290 },
      { sender: userIds[0], text: "Agreed. Though I'm worried about latency.",              minsAgo: 275 },
      { sender: userIds[2], text: "We can add a Redis cache layer. Should help.",           minsAgo: 260 },
      { sender: userIds[0], text: "Good point. Let's propose that in the next meeting.",    minsAgo: 240 },
      { sender: userIds[2], text: "Absolutely. I'll prep some benchmarks.",                 minsAgo: 220 },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[0], text: "Rahul, did you see the bug in the login flow?",          minsAgo: 100 },
      { sender: userIds[2], text: "Yeah I noticed it this morning. Session timeout issue.", minsAgo: 95  },
      { sender: userIds[0], text: "We should fix it before the sprint ends.",               minsAgo: 70  },
      { sender: userIds[2], text: "Agreed. I can start on it after lunch.",                 minsAgo: 60  },
      { sender: userIds[0], text: "Should we sync on the approach first?",                  minsAgo: 25  },
      { sender: userIds[2], text: p2pChat2LastMsg,                                          minsAgo: 15  },
    ]),
  ],
};

// ─── P2P Chat 3: Priya ↔ Sneha ───────────────────────────────────────────────

const p2pChat3 = {
  _id: p2pChat3Id,
  isGroup: false,
  users: [
    { name: "Priya Mehta",  userId: userIds[1] },
    { name: "Sneha Kapoor", userId: userIds[3] },
  ],
  lastMessageAt: p2pChat3LastMsgAt,
  lastMessage:   p2pChat3LastMsg,
  messageGroups: [
    // ── 3 days ago ──────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(3), [
      { sender: userIds[3], text: "Priya!! I just got promoted to Senior Designer 🎉",      minsAgo: 400 },
      { sender: userIds[1], text: "WHAT!!! Sneha that's AMAZING!! I'm so proud of you!",   minsAgo: 390 },
      { sender: userIds[3], text: "Thank you! I still can't believe it honestly.",          minsAgo: 380 },
      { sender: userIds[1], text: "You deserve every bit of it. We have to celebrate!",    minsAgo: 360 },
      { sender: userIds[3], text: "Yes! Nisha's party on Friday — we'll celebrate there?", minsAgo: 340 },
      { sender: userIds[1], text: "Perfect! I'll get you something special 🎁",             minsAgo: 320 },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[3], text: "Priya! Are you coming to Nisha's party tonight?",        minsAgo: 120 },
      { sender: userIds[1], text: "Of course! I already got her a gift 🎁",                 minsAgo: 110 },
      { sender: userIds[3], text: "Haha you're always so prepared.",                        minsAgo: 100 },
      { sender: userIds[1], text: "We should carpool, saves the hassle of parking.",        minsAgo: 70  },
      { sender: userIds[3], text: "Great idea! I'll pick you up at 7?",                     minsAgo: 50  },
      { sender: userIds[1], text: p2pChat3LastMsg,                                          minsAgo: 35  },
    ]),
  ],
};

// ─── P2P Chat 4: Rahul ↔ Aisha ───────────────────────────────────────────────

const p2pChat4 = {
  _id: p2pChat4Id,
  isGroup: false,
  users: [
    { name: "Rahul Verma", userId: userIds[2] },
    { name: "Aisha Khan",  userId: userIds[4] },
  ],
  lastMessageAt: p2pChat4LastMsgAt,
  lastMessage:   p2pChat4LastMsg,
  messageGroups: [
    // ── Yesterday ───────────────────────────────────────────────────────────
    makeMessageGroup(daysAgo(1), [
      { sender: userIds[4], text: "Rahul, how's the code review going on my PR?",           minsAgo: 300 },
      { sender: userIds[2], text: "Almost done! A couple of minor style comments.",         minsAgo: 290 },
      { sender: userIds[4], text: "Anything blocking?",                                     minsAgo: 280 },
      { sender: userIds[2], text: "Nope, should be good to merge after my comments.",       minsAgo: 270 },
      { sender: userIds[4], text: "Awesome, I'll address them tonight.",                    minsAgo: 250 },
      { sender: userIds[2], text: "Sounds good. Great work on the auth flow btw!",         minsAgo: 240 },
      { sender: userIds[4], text: "Thanks! Learned a lot building it.",                     minsAgo: 220 },
    ]),
    // ── Today ───────────────────────────────────────────────────────────────
    makeMessageGroup(now, [
      { sender: userIds[4], text: "Rahul, the token refresh endpoint is returning a 500.", minsAgo: 80 },
      { sender: userIds[2], text: "Hmm, let me check the logs.",                            minsAgo: 75 },
      { sender: userIds[2], text: "Found it — null dereference in the middleware.",         minsAgo: 60 },
      { sender: userIds[4], text: "Oh that explains it. Can you patch it?",                 minsAgo: 45 },
      { sender: userIds[2], text: "Already on it, give me 10 mins.",                       minsAgo: 20 },
      { sender: userIds[2], text: p2pChat4LastMsg,                                          minsAgo: 8  },
    ]),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

const fakeUsers = [
  // ── Arjun ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[0],
    name: "Arjun Sharma",
    email: "person1@gmail.com",
    password: "person123",
    picture: "userPic.jpg",
    contactNo: 3,
    groupNo: 2,
    videoChatNo: 2,
    contacts: [
      { name: "Priya Mehta",  userId: userIds[1] },
      { name: "Rahul Verma",  userId: userIds[2] },
      { name: "Sneha Kapoor", userId: userIds[3] },
    ],
    chats: [
      chatEntry({
        chatId: groupChat1Id,
        names: ["Priya Mehta", "Sneha Kapoor"],
        userIdList: [userIds[1], userIds[3]],
        preview: groupChat1LastMsg,
        isGroup: true,
        groupName: "Weekend Plans 🏕️",
        unreadCount: 0,
        lastMessageTime: groupChat1LastMsgAt,
      }),
      chatEntry({
        chatId: groupChat2Id,
        names: ["Rahul Verma", "Aisha Khan"],
        userIdList: [userIds[2], userIds[4]],
        preview: groupChat2LastMsg,
        isGroup: true,
        groupName: "Dev Team 💻",
        unreadCount: 0,
        lastMessageTime: groupChat2LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat1Id,
        names: ["Priya Mehta"],
        userIdList: [userIds[1]],
        preview: p2pChat1LastMsg,
        isGroup: false,
        unreadCount: 0,
        lastMessageTime: p2pChat1LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat2Id,
        names: ["Rahul Verma"],
        userIdList: [userIds[2]],
        preview: p2pChat2LastMsg,
        isGroup: false,
        unreadCount: 0,
        lastMessageTime: p2pChat2LastMsgAt,
      }),
    ],
  },

  // ── Priya ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[1],
    name: "Priya Mehta",
    email: "person2@gmail.com",
    password: "person246",
    picture: "userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [
      { name: "Arjun Sharma",  userId: userIds[0] },
      { name: "Sneha Kapoor",  userId: userIds[3] },
    ],
    chats: [
      chatEntry({
        chatId: groupChat1Id,
        names: ["Arjun Sharma", "Sneha Kapoor"],
        userIdList: [userIds[0], userIds[3]],
        preview: groupChat1LastMsg,
        isGroup: true,
        groupName: "Weekend Plans 🏕️",
        unreadCount: 2,
        lastMessageTime: groupChat1LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat1Id,
        names: ["Arjun Sharma"],
        userIdList: [userIds[0]],
        preview: p2pChat1LastMsg,
        isGroup: false,
        unreadCount: 1,
        lastMessageTime: p2pChat1LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat3Id,
        names: ["Sneha Kapoor"],
        userIdList: [userIds[3]],
        preview: p2pChat3LastMsg,
        isGroup: false,
        unreadCount: 0,
        lastMessageTime: p2pChat3LastMsgAt,
      }),
    ],
  },

  // ── Rahul ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[2],
    name: "Rahul Verma",
    email: "person3@gmail.com",
    password: "person369",
    picture: "userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 0,
    contacts: [
      { name: "Arjun Sharma", userId: userIds[0] },
      { name: "Aisha Khan",   userId: userIds[4] },
    ],
    chats: [
      chatEntry({
        chatId: groupChat2Id,
        names: ["Arjun Sharma", "Aisha Khan"],
        userIdList: [userIds[0], userIds[4]],
        preview: groupChat2LastMsg,
        isGroup: true,
        groupName: "Dev Team 💻",
        unreadCount: 1,
        lastMessageTime: groupChat2LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat2Id,
        names: ["Arjun Sharma"],
        userIdList: [userIds[0]],
        preview: p2pChat2LastMsg,
        isGroup: false,
        unreadCount: 2,
        lastMessageTime: p2pChat2LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat4Id,
        names: ["Aisha Khan"],
        userIdList: [userIds[4]],
        preview: p2pChat4LastMsg,
        isGroup: false,
        unreadCount: 0,
        lastMessageTime: p2pChat4LastMsgAt,
      }),
    ],
  },

  // ── Sneha ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[3],
    name: "Sneha Kapoor",
    email: "person4@gmail.com",
    password: "person4812",
    picture: "userPic.jpg",
    contactNo: 2,
    groupNo: 1,
    videoChatNo: 3,
    contacts: [
      { name: "Arjun Sharma", userId: userIds[0] },
      { name: "Priya Mehta",  userId: userIds[1] },
    ],
    chats: [
      chatEntry({
        chatId: groupChat1Id,
        names: ["Arjun Sharma", "Priya Mehta"],
        userIdList: [userIds[0], userIds[1]],
        preview: groupChat1LastMsg,
        isGroup: true,
        groupName: "Weekend Plans 🏕️",
        unreadCount: 0,
        lastMessageTime: groupChat1LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat3Id,
        names: ["Priya Mehta"],
        userIdList: [userIds[1]],
        preview: p2pChat3LastMsg,
        isGroup: false,
        unreadCount: 1,
        lastMessageTime: p2pChat3LastMsgAt,
      }),
    ],
  },

  // ── Aisha ─────────────────────────────────────────────────────────────────
  {
    _id: userIds[4],
    name: "Aisha Khan",
    email: "person5@gmail.com",
    password: "person51015",
    picture: "userPic.jpg",
    contactNo: 1,
    groupNo: 1,
    videoChatNo: 1,
    contacts: [
      { name: "Rahul Verma", userId: userIds[2] },
    ],
    chats: [
      chatEntry({
        chatId: groupChat2Id,
        names: ["Arjun Sharma", "Rahul Verma"],
        userIdList: [userIds[0], userIds[2]],
        preview: groupChat2LastMsg,
        isGroup: true,
        groupName: "Dev Team 💻",
        unreadCount: 3,
        lastMessageTime: groupChat2LastMsgAt,
      }),
      chatEntry({
        chatId: p2pChat4Id,
        names: ["Rahul Verma"],
        userIdList: [userIds[2]],
        preview: p2pChat4LastMsg,
        isGroup: false,
        unreadCount: 1,
        lastMessageTime: p2pChat4LastMsgAt,
      }),
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════════════════════════════

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

    console.log("\n─── Seeded IDs ────────────────────────────────────────────");
    fakeUsers.forEach((u) => console.log(`  ${u.name.padEnd(18)} → ${u._id}`));
    console.log(`  ${"Group Chat 1".padEnd(18)} → ${groupChat1Id}  (Weekend Plans 🏕️)`);
    console.log(`  ${"Group Chat 2".padEnd(18)} → ${groupChat2Id}  (Dev Team 💻)`);
    console.log(`  ${"P2P: Arjun↔Priya".padEnd(18)} → ${p2pChat1Id}`);
    console.log(`  ${"P2P: Arjun↔Rahul".padEnd(18)} → ${p2pChat2Id}`);
    console.log(`  ${"P2P: Priya↔Sneha".padEnd(18)} → ${p2pChat3Id}`);
    console.log(`  ${"P2P: Rahul↔Aisha".padEnd(18)} → ${p2pChat4Id}`);
    console.log("───────────────────────────────────────────────────────────\n");

    console.log("─── Login Credentials ──────────────────────────────────────");
    fakeUsers.forEach((u) =>
      console.log(`  ${u.email.padEnd(26)} →  ${u.password}`)
    );
    console.log("───────────────────────────────────────────────────────────\n");

    console.log("🌱 Seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();