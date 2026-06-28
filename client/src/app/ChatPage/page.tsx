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
import { useSelector, useDispatch } from "react-redux";
import { ChatEmptyState, SidebarEmptyState } from "./chatEmptyState";
import { RootState } from "@/redux/store";
import {
  updateChatList,
  updateUnReadMessage,
  updateActiveChat,
  setOnlineUsersList,
  setUserOnline,
  setUserOffline,
  addNewUser,
  addNewGroup,
} from "@/redux/userSlice";
import { socket } from "@/lib/socket";
import GroupPanel from "./groupPanel";

interface Chats {
  name: string[];
  UserId: string[];
  picture: string;
  preview: string;
  groupName?: string;
  isGroup: boolean;
  chatId: string;
  unreadCount: number;
  lastMessageTime: Date;
  onlineStatus?: boolean;
}

interface ActiveChatUser {
  id?: string;
  name?: string;
  groupName?: string;
  names?: string[];
  picture?: string;
}

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<null | any>(null);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [activeChatStatus, setActiveChatStatus] = useState<boolean | undefined>(
    false,
  );
  const [emojiActive, setEmojiActive] = useState<boolean>(false);
  const [sendMessage, setSendMessage] = useState<string>("");
  const [userList, setUserList] = useState<string[]>([]);
  const bottomRef = useRef<HTMLSpanElement | null>(null);
  const Dispatch = useDispatch();
  const [isGroupChat, setIsGroupChat] = useState<boolean>(false);
  const activeChatIdRef = useRef(activeChatId);
  const activeChatRef = useRef(activeChat);
  const [groupPanelStatus, setGroupPanelStatus] = useState<boolean>(false);
  const [activeChatUser, setActiveChatUser] = useState<ActiveChatUser>({});
  const personChatList: Chats[] = useSelector(
    (state: RootState) => state.user.chats,
  );

  const userId: string | null = useSelector(
    (state: RootState) => state.user.id,
  );

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    socket.emit("onlineUsers", (users: string[]) => {
      console.log("online user Active :- ", users);
      Dispatch(setOnlineUsersList(users));
    });
    socket.on("userOnline", (userId: string) => {
      console.log("online user :- ", userId);
      if (userId == activeChatId) setActiveChatStatus(false);
      Dispatch(setUserOnline(userId));
    });
    socket.on("userOffline", (userId: string) => {
      console.log("offline user :- ", userId);
      if (userId == activeChatId) setActiveChatStatus(false);
      Dispatch(setUserOffline(userId));
    });

    socket.on("newMessage", handleNewMessage);

    socket.on("newContact", (data) => {
      console.log("newContact :- ", data);
      Dispatch(addNewUser(data));
    });

    socket.on("newGroupAdd", (chat) => {
      console.log("Received NewGroup:", chat);
      Dispatch(addNewGroup(chat));
    });

    socket.on("hello", () => {
      console.log("hello");
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("onlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("newContact");
      socket.off("newGroupAdd");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat]);

  function handleNewMessage({
    chatId,
    senderId,
    message,
  }: {
    chatId: string;
    senderId: string;
    message: string;
  }): void {
    if (activeChatIdRef.current !== chatId) {
      console.log("non active chat message");
      Dispatch(
        updateUnReadMessage({
          message,
          chatId,
        }),
      );

      return;
    }

    console.log("handleNewMessage :-", { chatId, senderId, message });

    if (!activeChatRef.current) return;

    const current = activeChatRef.current;
    const isNewDay =
      new Date(current.lastMessageAt).toDateString() !==
      new Date().toDateString();

    if (isNewDay) {
      const data = {
        date: new Date(),
        chats: [
          {
            id: Date.now(),
            sender: senderId,
            textMessage: true,
            text: message,
            createdAt: new Date(),
          },
        ],
      };
      console.log({ data });
      setActiveChat({
        ...current,
        messageGroups: [...current.messageGroups, data],
        lastMessage: message,
        lastMessageAt: new Date(),
      });
    } else {
      const data = {
        id: Date.now(),
        sender: senderId,
        textMessage: true,
        text: message,
        createdAt: new Date(),
      };
      const lastChatIndex = current.messageGroups.length - 1;
      console.log({ data });
      setActiveChat({
        ...current,
        messageGroups: current.messageGroups.map((group, index) =>
          index === lastChatIndex
            ? { ...group, chats: [...group.chats, data] }
            : group,
        ),
        lastMessage: message,
        lastMessageAt: new Date(),
      });
    }
  }

  async function selectedChat(chatId: string, unreadCount: number) {
    setActiveChatId(chatId);
    await fetch(`/api/chat/${chatId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let filterData: string[] = [];
        for (let user of data.data.users) {
          if (user.userId != userId) filterData.push(user.userId);
        }
        console.log("filter");
        setUserList(filterData);
        console.log(filterData);
        console.log("chat Data :-", data.data);
        setActiveChat(data.data);
      })
      .catch((err) => console.log(err));

    if (unreadCount != 0) {
      await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.success) {
            Dispatch(
              updateChatList({
                chats: data.chats,
              }),
            );
          }
        })
        .catch((err) => console.log(err));
    }
  }

  function displayMessage(messageType: string, emoji: string = ""): void {
    console.log(messageType, emoji);

    if (!activeChat) return;

    if (sendMessage == "" && messageType == "text") {
      return;
    }
    const lastChatIndex: number = activeChat.messageGroups.length - 1;

    console.log(
      new Date(activeChat.lastMessageAt).toDateString(),
      new Date().toDateString(),
    );

    if (
      new Date(activeChat.lastMessageAt).toDateString() !=
      new Date().toDateString()
    ) {
      const data = {
        date: new Date(),
        chats: [
          {
            id: Date.now(),
            sender: userId,
            textMessage: messageType == "text" ? true : false,
            text: messageType == "text" ? sendMessage : emoji,
            createdAt: new Date(),
          },
        ],
      };

      console.log(data);

      setActiveChat({
        ...activeChat,
        messageGroups: [...activeChat.messageGroups, data],
        lastMessage: sendMessage,
        lastMessageAt: new Date(),
      });

      socket.emit("newMessage-new", {
        userList,
        chatId: activeChatId,
        senderId: userId,
        data,
        sendMessage,
      });
    } else {
      const data = {
        id: Date.now(),
        sender: userId,
        textMessage: messageType == "text" ? true : false,
        text: messageType == "text" ? sendMessage : emoji,
        createdAt: new Date(),
      };

      console.log(data);

      setActiveChat({
        ...activeChat,
        messageGroups: activeChat.messageGroups.map((group, index) =>
          index == lastChatIndex
            ? {
                ...group,
                chats: [...group.chats, data],
              }
            : group,
        ),
        lastMessage: sendMessage,
        lastMessageAt: new Date(),
      });

      socket.emit("newMessage-existing", {
        userList,
        chatId: activeChatId,
        senderId: userId,
        data,
        sendMessage,
      });
    }
    console.log(activeChat);
    Dispatch(
      updateActiveChat({
        message: sendMessage,
        chatId: activeChatId,
      }),
    );
    if (messageType == "text") setSendMessage("");
  }

  return (
    <div className="chatPage flex h-full relative">
      <aside className="chatSidebar w-[320px] shrink-0 h-full px-3 py-4 flex flex-col">
        <div className="chatSidebar-header flex items-center justify-between px-1">
          <h1>Messages</h1>
          <button
            className="groupCreate flex items-center"
            onClick={() => setGroupPanelStatus(true)}
          >
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

        {personChatList.length == 0 ? (
          <SidebarEmptyState />
        ) : (
          <div className="personBoxList flex flex-col gap-1 mt-4 overflow-y-auto flex-1 min-h-0">
            {personChatList.map((data, index) => (
              <PersonBox
                key={index}
                name={data.isGroup ? data.groupName : data.name[0]}
                picture={data.isGroup ? "/groupPic.jpg" : data.picture}
                preview={data.preview}
                isGroup={data.isGroup}
                lastMessageAt={data.lastMessageTime}
                unreadCount={data.unreadCount}
                online={data?.onlineStatus}
                onClick={() => {
                  selectedChat(data.chatId, data.unreadCount);
                  setActiveChatId(data.chatId);
                  console.log("user set Data :- ");
                  console.log(data);
                  if (!data.isGroup) {
                    setIsGroupChat(false);
                    setActiveChatStatus(data?.onlineStatus);
                    setActiveChatUser({
                      id: data.UserId[0],
                      name: data.name[0],
                      picture: data.picture,
                    });
                    console.log("active Chat (!isGroup) :- ", {
                      name: data.name[0],
                      userId,
                      sendId: data.UserId[0],
                      chatId: data.chatId,
                    });
                  } else {
                    setIsGroupChat(true);
                    setActiveChatUser({
                      groupName: data.groupName,
                      names: data.name,
                      picture: "/groupPic.jpg",
                    });
                    console.log("active Chat (isGroup) :- ", {
                      groupName: data.groupName,
                      names: data.name,
                      picture: "/groupPic.jpg",
                    });
                  }

                  socket.emit("activeChat", { userId, chatId: data.chatId });
                }}
              />
            ))}
          </div>
        )}
      </aside>

      <section className="chatMain flex-1 min-w-0 h-full relative">
        {personChatList.length == 0 ? (
          <ChatEmptyState variant="no-contacts" />
        ) : !activeChat ? (
          <ChatEmptyState variant="no-selection" />
        ) : (
          <>
            <header className="chatHeader flex items-center px-4 py-3">
              <span
                className="w-[60px] h-[60px] rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${activeChatUser.picture})`,
                }}
              />
              <div className="ms-3 flex flex-col gap-0.5">
                <span className="chat-name">
                  {isGroupChat ? activeChatUser.groupName : activeChatUser.name}
                </span>
                <span className="chat-username">
                  {isGroupChat
                    ? activeChatUser.names?.join(", ")
                    : activeChatUser.id}
                </span>
                <span
                  className={`chat-status ${activeChatStatus ? "online" : "offline"}`}
                >
                  {isGroupChat ? null : activeChatStatus ? "Online" : "Offline"}
                </span>
              </div>
              <button className="menu-btn ms-auto">
                <BsThreeDotsVertical />
              </button>
            </header>

            <div className="messageBoxScreen overflow-y-auto px-4 py-4 flex flex-col">
              {activeChat.messageGroups.map((data, index: number) => {
                return (
                  <span key={index}>
                    <>
                      <MessageDate date={data.date} />
                      <Message chatData={data.chats} users={activeChat.users} />
                    </>
                    <span className="scrollBottom" ref={bottomRef} />
                  </span>
                );
              })}
            </div>

            <EmojiBox
              emojiState={emojiActive}
              displayMessage={displayMessage}
            />

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
                  emojiActive == true
                    ? setEmojiActive(false)
                    : setEmojiActive(true)
                }
              >
                <FaRegFaceSmile />
              </button>
              <textarea
                className="messageSendBox px-4 py-3 resize-none overflow-hidden "
                placeholder="Type a message..."
                rows={1}
                value={sendMessage}
                onChange={(e) => {
                  // console.log(e.target.value);
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
      {groupPanelStatus && (
        <GroupPanel setGroupPanelStatus={setGroupPanelStatus} />
      )}
    </div>
  );
}
