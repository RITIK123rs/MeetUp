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
import { ChatEmptyState, SidebarEmptyState } from "./chatEmptyState";

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


export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<Conversation | null >(null);
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

    if (!activeChat) return;

    if (sendMessage == "" && messageType == "text") {
      return;
    }
    const lastChatIndex: number = activeChat.messageGroups.length - 1;

    if (
      activeChat.lastMessageAt.toDateString() !=
      activeChat.messageGroups[lastChatIndex].date.toDateString()
    ) {
      setActiveChat({
        ...activeChat,
        messageGroups: [
          ...activeChat.messageGroups,
          {
            date: new Date(),
            chats: [
              {
                id: Date.now(),
                sender: "me",
                textMessage: messageType == "text" ? true : false,
                text: messageType == "text" ? sendMessage : emoji,
                createdAt: new Date(),
              },
            ],
          },
        ],
      });
    } else {
      setActiveChat({
        ...activeChat,
        messageGroups: activeChat.messageGroups.map((group, index) =>
          index == lastChatIndex
            ? {
                ...group,
                chats: [
                  ...group.chats,
                  {
                    id: Date.now(),
                    sender: "me",
                    textMessage: messageType == "text" ? true : false,
                    text: messageType == "text" ? sendMessage : emoji,
                    createdAt: new Date(),
                  },
                ],
              }
            : group,
        ),
      });
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

        {conversations.length == 0 ? (
          <SidebarEmptyState />
        ) : (
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
        )}
      </aside>

      <section className="chatMain flex-1 min-w-0 h-full relative">
         { conversations.length==0 ? (
          <ChatEmptyState variant="no-contacts" />
        ) : !activeChat ? (
          <ChatEmptyState variant="no-selection" />
        ) : (
          <>
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
        </>
        )}
      </section>
    </div>
  );
}
