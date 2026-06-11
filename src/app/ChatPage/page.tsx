"use client";

import { useState, useRef, useEffect } from "react";
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
import EmojiBox from "./emojiBox";

interface Message {
  id: number;
  sender: "me" | "them";
  textMessage: boolean;
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
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 1,
            sender: "them",
            textMessage: true,
            text: "Hey Ritik 👋",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "them",
            textMessage: true,
            text: "How are you?",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "me",
            textMessage: true,
            text: "Doing great 😄",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "me",
            textMessage: true,
            text: "Working on a chat app.",
            createdAt: new Date(),
          },
          {
            id: 5,
            sender: "them",
            textMessage: true,
            text: "Nice! React or Next.js?",
            createdAt: new Date(),
          },
          {
            id: 6,
            sender: "me",
            textMessage: true,
            text: "Next.js + TypeScript 🚀",
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
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 1,
            sender: "them",
            textMessage: true,
            text: "Meeting moved to 3 PM.",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "me",
            textMessage: true,
            text: "Thanks for letting me know 👍",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "them",
            textMessage: true,
            text: "No problem.",
            createdAt: new Date(),
          },
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
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 1,
            sender: "me",
            textMessage: true,
            text: "Can you send the designs?",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "them",
            textMessage: true,
            text: "Sure, sending now 📎",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "them",
            textMessage: true,
            text: "Check your inbox.",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "me",
            textMessage: true,
            text: "Received. Thanks 😊",
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
        date: new Date("10 June 2026"),
        chats: [
          {
            id: 1,
            sender: "me",
            textMessage: true,
            text: "Want to build something together?",
            createdAt: new Date(),
          },
          {
            id: 2,
            sender: "them",
            textMessage: true,
            text: "Sure! What do you have in mind?",
            createdAt: new Date(),
          },
          {
            id: 3,
            sender: "me",
            textMessage: true,
            text: "A real-time chat application 💬",
            createdAt: new Date(),
          },
          {
            id: 4,
            sender: "them",
            textMessage: true,
            text: "That sounds great 👍",
            createdAt: new Date(),
          },
          {
            id: 5,
            sender: "me",
            textMessage: true,
            text: "Let's start this weekend 🚀",
            createdAt: new Date(),
          },
        ],
      },
    ],
  },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Conversation>(conversations[0]);
  const [emojiActive, setEmojiActive] = useState<boolean>(false);
  const [sendMessage, setSendMessage] = useState<string>("");
  const bottomRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat]);

  function displayMessage(messageType: string, emoji: string = ""): void {
    console.log(messageType, emoji);

    if (sendMessage == "" && messageType == "text") {
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
                textMessage: messageType == "text" ? true : false,
                text: messageType == "text" ? sendMessage : emoji,
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
                    textMessage: messageType == "text" ? true : false,
                    text: messageType == "text" ? sendMessage : emoji,
                    createdAt: new Date(),
                  },
                ],
              }
            : group,
        ),
      }));
    }
    console.log(activeChat);
    if (messageType == "text") setSendMessage("");
  }

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
              name={conversation.name}
              initials={conversation.initials}
              preview={conversation.preview}
              lastMessageAt={conversation.lastMessageAt}
              unreadCount={conversation.unreadCount}
              online={conversation.online}
              onClick={() => setActiveChat(conversation)}
            />
          ))}
        </div>
      </aside>

      <section className="chatMain flex-1 min-w-0 h-full relative">
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
          {activeChat.messageGroups.map((data, index) => {
            return (
              <>
                <span key={index}>
                  <MessageDate date={data.date} />
                  <Message chatData={data.chats} />
                </span>
                <span className="scrollBottom" ref={bottomRef} />
              </>
            );
          })}
        </div>

        <EmojiBox emojiState={emojiActive} displayMessage={displayMessage} />

        <footer className="messageInputBar flex items-center">
          <button
            className="inputIconBtn"
            type="button"
            aria-label="Attach file"
          >
            <FiPaperclip />
          </button>
          <button
            className="inputIconBtn"
            type="button"
            aria-label="Emoji"
            onClick={() =>
              emojiActive == true ? setEmojiActive(false) : setEmojiActive(true)
            }
          >
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
            onClick={() => displayMessage("text")}
          >
            <FiSend />
          </button>
        </footer>
      </section>
    </div>
  );
}
