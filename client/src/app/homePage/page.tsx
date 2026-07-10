"use client";

import { IoChatbubbles } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { MdOutlineLogout } from "react-icons/md";
import "@/style/homepage.css";
import ChatPage from "../ChatPage/page";
import { useEffect, useState } from "react";
import Banner from "./banner";
import MessageBox from "./messageBox";
import VideoBox from "./videoBox";
import { LoginUserCheck } from "@/lib/login";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { showNotification } from "@/redux/notificationSlice";
import {
  addNewUser,
  addNewGroup,
  updateUnReadMessage,
  clearUser,
} from "@/redux/userSlice";

const menuBtnBase: string =
  "w-12 h-12 flex rounded-xl items-center justify-center text-text-secondary transition-colors duration-150 hover:bg-[var(--bg-hover)] hover:text-text-primary";
const menuBtnActive: string = "bg-violet-600/20 text-accent-violet shadow-none";

function HomePageMain() {
  return (
    <div className="homepage-main-container flex flex-col h-full overflow-hidden px-7 pt-[22px] pb-6">
      <Banner />
      <div className="home-cards-scroll grid grid-cols-2 gap-[15px] mt-4 flex-1 min-h-0 items-start content-start">
        <MessageBox />
        <VideoBox />
      </div>
    </div>
  );
}

export default function homePage() {
  const Dispatch = useDispatch();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mainContent, setMainContent] = useState<string>("homePage");
  const userPicture: string = useSelector(
    (state: RootState) => state.user.picture,
  )!;
  const userEmail: string = useSelector(
    (state: RootState) => state.user.email,
  )!;
  const userName = useSelector((state: RootState) => state.user.name)!;

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (!stored) {
      router.replace("/");
      return;
    }

    let userData;

    try {
      userData = JSON.parse(stored);
    } catch {
      sessionStorage.removeItem("user");
      router.replace("/");
      return;
    }

    if (!userData || !userData.id) {
      sessionStorage.removeItem("user");
      router.replace("/");
      return;
    }

    if (!socket.connected) {
      socket.auth = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };
      socket.connect();
    }

    socket.on("newMessage", ({ chatId, senderId, message }) => {
      // console.log("updateUnReadMessage", { chatId, senderId, message });
      Dispatch(
        updateUnReadMessage({
          message,
          chatId,
        }),
      );
    });

    socket.on("newContact", (data) => {
      console.log("newContact :- ", data);
      Dispatch(addNewUser(data));
      Dispatch(
        showNotification({
          message: `${data?.addContact?.name ?? "Someone"} added you as a contact`,
          type: "info",
        }),
      );
    });

    socket.on("connect_error", (err) => {
      console.log(err);
      console.log(err.message);
      Dispatch(
        showNotification({
          message: "Connection lost. Trying to reconnect...",
          type: "error",
        }),
      );
    });

    socket.on("newGroupAdd", (chat) => {
      // console.log("Received NewGroup:", chat);
      Dispatch(addNewGroup(chat));
      Dispatch(
        showNotification({
          message: "You were added to a new group",
          type: "info",
        }),
      );
    });

    return () => {
      // socket.disconnect();
      socket.off("newMessage");
      socket.off("newContact");
      socket.off("newGroupAdd");
      socket.off("connect_error");
    };
  }, []);

  function handleLogOut() {
    if (socket.connected) {
      socket.disconnect();
    }
    sessionStorage.removeItem("user");
    Dispatch(clearUser());
    Dispatch(
      showNotification({ message: "You've been logged out", type: "success" }),
    );
    router.replace("/");
  }

  return (
    <div className="bg-bg-base w-screen h-screen flex">
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-bg-surface border-l border-[var(--border-subtle)] flex flex-col p-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[image:var(--accent-gradient)] shadow-[0_4px_12px_rgba(99,102,241,0.3)] flex rounded-lg items-center justify-center [&_svg]:w-5 [&_svg]:h-5">
                  <IoChatbubbles className="text-white" />
                </div>
                <span className="text-lg font-bold tracking-wide bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
                  meetUp
                </span>
              </div>
              <button
                type="button"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-[var(--bg-hover)] hover:text-text-primary transition-colors"
                onClick={() => setIsDrawerOpen(false)}
              >
                <FiX className="size-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <button
                type="button"
                className={`w-full h-12 px-4 flex items-center gap-3 rounded-xl text-left transition-colors duration-150 ${
                  mainContent === "homePage"
                    ? "bg-violet-600/20 text-accent-violet border border-violet-600/30"
                    : "text-text-secondary hover:bg-[var(--bg-hover)] hover:text-text-primary"
                }`}
                onClick={() => {
                  setMainContent("homePage");
                  setIsDrawerOpen(false);
                }}
              >
                <IoHome className="size-5" />
                <span className="font-semibold text-sm">Home</span>
              </button>
              <button
                type="button"
                className={`w-full h-12 px-4 flex items-center gap-3 rounded-xl text-left transition-colors duration-150 ${
                  mainContent === "chatPage"
                    ? "bg-violet-600/20 text-accent-violet border border-violet-600/30"
                    : "text-text-secondary hover:bg-[var(--bg-hover)] hover:text-text-primary"
                }`}
                onClick={() => {
                  setMainContent("chatPage");
                  setIsDrawerOpen(false);
                }}
              >
                <FaRegMessage className="size-5" />
                <span className="font-semibold text-sm">Messages</span>
              </button>
            </nav>

            <div className="mt-auto flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-surface border border-[var(--border-subtle)] flex items-center justify-center text-text-secondary overflow-hidden shrink-0">
                  {userPicture ? (
                    <img
                      src={userPicture}
                      alt={userName || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/userPic.jpg";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-bold uppercase">
                      {userName ? userName[0] : "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary text-sm truncate">
                    {userName}
                  </h4>
                  <p className="text-xs text-text-muted truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-sm border border-red-500/20 transition-all"
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleLogOut();
                }}
              >
                <MdOutlineLogout className="text-lg" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="bg-bg-surface border-r border-[var(--border-subtle)] min-w-24 w-24 h-full flex flex-col items-center py-5">
        <div className="w-full flex flex-col items-center gap-2">
          <div className="w-[52px] h-[52px] bg-[image:var(--accent-gradient)] shadow-[0_4px_15px_rgba(99,102,241,0.35)] flex rounded-xl items-center justify-center [&_svg]:w-[1.65rem] [&_svg]:h-[1.65rem]">
            <IoChatbubbles className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-wide text-center leading-tight bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
            MeetUp
          </span>
        </div>

        <nav className="homepage-main-container flex flex-col items-center gap-2 mt-8">
          <button
            className={`${menuBtnBase} ${mainContent === "homePage" ? menuBtnActive : ""}`}
            title="Home"
            onClick={() => setMainContent("homePage")}
          >
            <IoHome className="size-5" />
          </button>
          <button
            className={`${menuBtnBase} ${mainContent === "chatPage" ? menuBtnActive : ""}`}
            title="Messages"
            onClick={() => setMainContent("chatPage")}
          >
            <FaRegMessage className="size-5" />
          </button>
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3 pb-2">
          <button
            className="text-text-muted rounded-sm w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-hover)] hover:text-text-secondary"
            title="Logout"
            onClick={handleLogOut}
          >
            <MdOutlineLogout className="text-xl" />
          </button>
          <img
            src={userPicture ?? "/default.jpg"}
            alt="User avatar"
            className="w-11 h-11 rounded-full object-cover"
          />
        </div>
      </aside>

      <main className="bg-bg-base flex-1 h-screen min-w-0 overflow-hidden flex flex-col">
        {mainContent === "homePage" && (
          <header className="mobile-header flex items-center gap-3.5 px-6 py-4 bg-bg-surface border-b border-[var(--border-subtle)] shrink-0">
            <button
              type="button"
              className="mobile-menu-btn text-text-secondary hover:text-text-primary p-2 -ml-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors active:scale-95"
              onClick={() => setIsDrawerOpen(true)}
              title="Open Navigation"
            >
              <FiMenu className="size-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[image:var(--accent-gradient)] shadow-[0_3px_10px_rgba(99,102,241,0.3)] flex rounded-lg items-center justify-center [&_svg]:w-5 [&_svg]:h-5 shrink-0">
                <IoChatbubbles className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-wide bg-[image:var(--accent-gradient)] bg-clip-text text-transparent leading-none">
                MeetUp
              </span>
            </div>
          </header>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          {mainContent === "homePage" ? (
            <HomePageMain />
          ) : (
            <ChatPage onOpenMenu={() => setIsDrawerOpen(true)} />
          )}
        </div>
      </main>
    </div>
  );
}
