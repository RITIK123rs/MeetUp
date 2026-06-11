"use client";

import { IoChatbubbles } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { MdOutlineLogout } from "react-icons/md";
import "@/style/homepage.css";
import ChatPage from "../ChatPage/page";
import { useState } from "react";
import Banner from "./banner";
import MessageBox from "./messageBox";
import VideoBox from "./videoBox";
import { useSelector, useDispatch } from "react-redux";

const menuBtnBase:string =
  "w-12 h-12 flex rounded-xl items-center justify-center text-text-secondary transition-colors duration-150 hover:bg-[var(--bg-hover)] hover:text-text-primary";
const menuBtnActive: string = "bg-violet-600/20 text-accent-violet shadow-none";

function HomePageMain() {
  return (
    <div className="flex flex-col h-full overflow-hidden px-7 pt-[22px] pb-6">
      <Banner />
      <div className="home-cards-scroll grid grid-cols-2 gap-[15px] mt-4 flex-1 min-h-0 items-start content-start">
        <MessageBox />
        <VideoBox />
      </div>
    </div>
  );
}

export default function homePage() {
  const [mainContent, setMainContent] = useState<string>("homePage");
  const userPicture:string = useSelector((state: any) => state.user.picture);

  return (
    <div className="bg-bg-base w-screen h-screen flex">
      <aside className="bg-bg-surface border-r border-[var(--border-subtle)] min-w-24 w-24 h-full flex flex-col items-center py-5">
        <div className="w-full flex flex-col items-center gap-2">
          <div className="w-[52px] h-[52px] bg-[image:var(--accent-gradient)] shadow-[0_4px_15px_rgba(99,102,241,0.35)] flex rounded-xl items-center justify-center [&_svg]:w-[1.65rem] [&_svg]:h-[1.65rem]">
            <IoChatbubbles className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-wide text-center leading-tight bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
            meetUp
          </span>
        </div>

        <nav className="flex flex-col items-center gap-2 mt-8">
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
          >
            <MdOutlineLogout className="text-xl" />
          </button>
          <div
            className="w-11 h-11 rounded-full bg-cover bg-center "
            style={{
              backgroundImage: `url(${userPicture})`,
            }}
          />
        </div>
      </aside>

      <main className="bg-bg-base flex-1 h-screen min-w-0 overflow-hidden">
        {mainContent === "homePage" ? <HomePageMain /> : <ChatPage />}
      </main>
    </div>
  );
}
