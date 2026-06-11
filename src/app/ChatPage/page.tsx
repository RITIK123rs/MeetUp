"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import PersonBox from "./personBox";
import { FaPlus } from "react-icons/fa";
import { FiPaperclip } from "react-icons/fi";
import { FaRegFaceSmile } from "react-icons/fa6";
import { MdKeyboardVoice } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import "@/style/chatPage.css";
import MessageDate from "./messageDate";
import Message from "./message";

interface Message {
  id: number;
  sender: "me" | "them";
  text: string;
  createdAt: Date;
}

interface MessageGroup {
  date: Date;
  chats: Message[];
}

interface Conversation {
  id: number;
  name: string;
  username: string;
  initials: string;
  preview: string;
  lastMessageAt: Date;
  unreadCount: number;
  online: boolean;
  messageGroups: MessageGroup[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Sarah Chen",
    username: "@sarahchen",
    initials: "SC",
    preview: "Let's catch up tomorrow!",
    lastMessageAt: new Date(),
    unreadCount: 2,
    online: true,
    messageGroups: [
      {
        date: new Date("9 June 2026"),
        chats: [
          { id: 1, sender: "them", text: "Hey Ritik!", createdAt: new Date() },
          { id: 2, sender: "me", text: "Hi Sarah 👋", createdAt: new Date() },
          {
            id: 3,
            sender: "them",
            text: "How's your project going?",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "me",
            text: "Pretty good so far.",
            createdAt: new Date(),
          },
        ],
      },
      {
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 1,
            sender: "me",
            text: "Hey",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "me",
            text: "Are you free today?",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "me",
            text: "Need help with something",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "them",
            text: "Hey!",
            createdAt: new Date(),
          },
          {
            id: 5,
            sender: "them",
            text: "Sorry, was busy",
            createdAt: new Date(),
          },
          {
            id: 6,
            sender: "them",
            text: "What's up?",
            createdAt: new Date(),
          },
          {
            id: 7,
            sender: "me",
            text: "Working on a chat app",
            createdAt: new Date(),
          },
          {
            id: 8,
            sender: "me",
            text: "Trying to improve the UI",
            createdAt: new Date(),
          },
          {
            id: 9,
            sender: "them",
            text: "Nice! React or Next.js?",
            createdAt: new Date(),
          },
          {
            id: 10,
            sender: "me",
            text: "Next.js with TypeScript",
            createdAt: new Date(),
          },
        ],
      },
    ],
  },

  {
    id: 2,
    name: "Alex Morgan",
    username: "@alexm",
    initials: "AM",
    preview: "Meeting moved to 3 PM.",
    lastMessageAt: new Date(),
    unreadCount: 0,
    online: false,
    messageGroups: [
      {
        date: new Date("8 June 2026"),
        chats: [
          {
            id: 1,
            sender: "them",
            text: "Are you available for a meeting?",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "me",
            text: "Yes, what time?",
            createdAt: new Date(),
          },
          { id: 3, sender: "them", text: "2 PM works?", createdAt: new Date() },
        ],
      },
      {
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 4,
            sender: "them",
            text: "Meeting moved to 3 PM.",
            createdAt: new Date(),
          },
          { id: 5, sender: "me", text: "Noted 👍", createdAt: new Date() },
        ],
      },
    ],
  },

  {
    id: 3,
    name: "Priya Patel",
    username: "@priyap",
    initials: "PP",
    preview: "Sent you the files 📎",
    lastMessageAt: new Date(),
    unreadCount: 1,
    online: true,
    messageGroups: [
      {
        date: new Date("7 June 2026"),
        chats: [
          {
            id: 1,
            sender: "me",
            text: "Can you share the design files?",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "them",
            text: "Sure, give me a minute.",
            createdAt: new Date(),
          },
        ],
      },
      {
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 3,
            sender: "them",
            text: "Sent you the files 📎",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "me",
            text: "Got them, thanks!",
            createdAt: new Date(),
          },
        ],
      },
    ],
  },

  {
    id: 4,
    name: "Emma Davis",
    username: "@emmad",
    initials: "ED",
    preview: "That sounds great 👍",
    lastMessageAt: new Date(),
    unreadCount: 5,
    online: true,
    messageGroups: [
      {
        date: new Date("5 June 2026"),
        chats: [
          {
            id: 1,
            sender: "me",
            text: "Want to work on a side project?",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "them",
            text: "Sure! What's the idea?",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "me",
            text: "A real-time chat application.",
            createdAt: new Date(),
          },
        ],
      },
      {
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 4,
            sender: "them",
            text: "That sounds great 👍",
            createdAt: new Date(),
          },
          {
            id: 5,
            sender: "me",
            text: "Let's start this weekend.",
            createdAt: new Date(),
          },
        ],
      },
    ],
  },
];

export default function ChatPage() {
  const [activeId, setActiveId] = useState<number>(conversations[0].id);
  const [activeChat, setActiveChat] = useState<Conversation>(
    conversations.find((c) => c.id === activeId) ?? conversations[0],
  );
  const [sendMessage, setSendMessage] = useState<string>("");

  return (
    <div className="chatPage flex h-full">
      <aside className="chatSidebar w-[320px] shrink-0 h-full px-3 py-4 flex flex-col">
        <div className="chatSidebar-header flex items-center justify-between px-1">
          <h1>Messages</h1>
          <button className="groupCreate flex items-center">
            <FaPlus className="text-xs" /> Group
          </button>
        </div>

        <div className="searchBox flex items-center ps-3 py-2 mt-4 mx-1">
          <FaSearch className="text-sm shrink-0" />
          <input
            type="text"
            className="outline-0 ms-2 w-full bg-transparent"
            placeholder="Search by name..."
          />
        </div>

        <div className="personBoxList flex flex-col gap-1 mt-4 overflow-y-auto flex-1 min-h-0">
          {conversations.map((conversation) => (
            <PersonBox
              key={conversation.id}
              active={conversation.id === activeId}
              name={conversation.name}
              initials={conversation.initials}
              preview={conversation.preview}
              lastMessageAt={conversation.lastMessageAt}
              unreadCount={conversation.unreadCount}
              online={conversation.online}
              onClick={() => setActiveId(conversation.id)}
            />
          ))}
        </div>
      </aside>

      <section className="chatMain flex-1 min-w-0 h-full">
        <header className="chatHeader flex items-center px-4 py-3">
          <div className="avatar w-11 h-11 rounded-full flex items-center justify-center">
            {activeChat.initials}
          </div>
          <div className="ms-3 flex flex-col gap-0.5">
            <span className="chat-name">{activeChat.name}</span>
            <span className="chat-username">{activeChat.username}</span>
            <span
              className={`chat-status ${activeChat.online ? "online" : "offline"}`}
            >
              {activeChat.online ? "Online" : "Offline"}
            </span>
          </div>
          <button className="menu-btn ms-auto">
            <BsThreeDotsVertical />
          </button>
        </header>

        <div className="messageBoxScreen overflow-y-auto px-4 py-4 flex flex-col">
          {/* <MessageDate />
          <Message /> */}

          {activeChat.messageGroups.map((data, index) => {
            return (
              <span key={index}>
                <MessageDate date={data.date} />
                <Message chatData={data.chats} />
              </span>
            );
          })}


        </div>

        <footer className="messageInputBar flex items-center">
          <button
            className="inputIconBtn"
            type="button"
            aria-label="Attach file"
          >
            <FiPaperclip />
          </button>
          <button className="inputIconBtn" type="button" aria-label="Emoji">
            <FaRegFaceSmile />
          </button>
          <input
            type="text"
            className="messageSendBox px-4 py-2.5"
            placeholder="Type a message..."
            value={sendMessage}
            onChange={(e) => {
              console.log(e.target.value);
              setSendMessage(e.target.value);
            }}
          />
          <button
            className="inputIconBtn"
            type="button"
            aria-label="Voice message"
          >
            <MdKeyboardVoice className="text-2xl" />
          </button>
          <button
            className="messageSendButton"
            type="button"
            aria-label="Send message"
            onClick={() => {
              if (sendMessage == "") {
                return;
              }
              const lastChatIndex: number = activeChat.messageGroups.length - 1;

              if (
                activeChat.lastMessageAt.toDateString() !=
                activeChat.messageGroups[lastChatIndex].date.toDateString()
              ) {
                setActiveChat((prev) => ({
                  ...prev,
                  messageGroups: [
                    ...prev.messageGroups,
                    {
                      date: new Date(),
                      chats: [
                        {
                          id: 1,
                          sender: "me",
                          text: sendMessage,
                          createdAt: new Date(),
                        },
                      ],
                    },
                  ],
                }));
              } else {
                setActiveChat((prev) => ({
                  ...prev,
                  messageGroups: prev.messageGroups.map((group, index) =>
                    index == lastChatIndex
                      ? {
                          ...group,
                          chats: [
                            ...group.chats,
                            {
                              id: 2,
                              sender: "me",
                              text: sendMessage,
                              createdAt: new Date(),
                            },
                          ],
                        }
                      : group,
                  ),
                }));
              }
              setSendMessage("");
            }}
          >
            <FiSend />
          </button>
        </footer>
      </section>
    </div>
  );
}
