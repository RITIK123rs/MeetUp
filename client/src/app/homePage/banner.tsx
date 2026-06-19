"use client";

import { useEffect, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { IoVideocam, IoPerson } from "react-icons/io5";
import { FaUserEdit, FaBell } from "react-icons/fa";
import { IconType } from "react-icons";
import { useSelector, useDispatch } from "react-redux";
import { LoginUserCheck } from "@/lib/login";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

interface Stat {
  label: string;
  value: number;
  icon: IconType;
  cardClass: string;
  iconClass: string;
}

interface Contacts {
  name: string;
  userId: string;
}

interface Chats {
  name: string[];
  UserId: string[];
  preview: string;
  isGroup: boolean;
  chatId: string;
  unreadCount: number;
  lastMessageTime: Date;
}

interface UserData {
  success: boolean;
  id: string;
  name: string;
  email: string;
  picture: string;
  contactNo: number;
  groupNo: number;
  videoChatNo: number;
  contacts: Contacts[];
  chats: Chats[];
}

export default function Banner() {
  const userData: UserData = useSelector((state: any) => state.user);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const stats: Stat[] = [
    {
      label: "Contacts",
      value: userData.contactNo,
      icon: IoPerson,
      cardClass:
        "bg-gradient-to-br from-violet-600/15 to-indigo-600/[0.08] shadow-[0_4px_20px_rgba(124,58,237,0.15)]",
      iconClass: "bg-gradient-to-br from-violet-600 to-indigo-500 text-white",
    },
    {
      label: "Groups",
      value: userData.groupNo,
      icon: BsPeopleFill,
      cardClass:
        "bg-gradient-to-br from-blue-500/15 to-cyan-500/[0.08] shadow-[0_4px_20px_rgba(59,130,246,0.15)]",
      iconClass: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white",
    },
    {
      label: "Video Chat",
      value: userData.videoChatNo,
      icon: IoVideocam,
      cardClass:
        "bg-gradient-to-br from-pink-500/15 to-rose-500/[0.08] shadow-[0_4px_20px_rgba(236,72,153,0.15)]",
      iconClass: "bg-gradient-to-br from-pink-500 to-rose-500 text-white",
    },
  ];

  return (
    <section className="banner-bg shrink-0 flex flex-col gap-[10px] px-7 pt-[24px] pb-[12px] rounded-xl border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.80rem] font-bold text-text-primary leading-tight">
            {getGreeting()},{" "}
            <span className="bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
              {userData?.name}
            </span>
          </p>
          <p className="text-[0.92rem] text-text-secondary mt-1">
            Welcome back to MeetUp
          </p>
        </div>
        <div className="flex items-center flex-wrap justify-end gap-x-3.5 gap-y-2.5 px-[18px] py-2.5 rounded-full bg-violet-600/10 border border-violet-600/20 shrink-0">
          <span className="text-[1rem] font-bold text-text-primary whitespace-nowrap">
            {dateStr}
          </span>
          <span className="text-[1rem] font-bold text-accent-violet tabular-nums whitespace-nowrap">
            {timeStr}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3.5 flex-1 min-w-0">
          {stats.map(({ label, value, icon: Icon, cardClass, iconClass }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-[18px] py-3.5 rounded-lg border border-[var(--border-subtle)] min-w-0 flex-1 max-w-[180px] transition-[transform,box-shadow] duration-150 hover:-translate-y-px ${cardClass}`}
            >
              <div
                className={`w-11 h-11 rounded-md flex items-center justify-center text-[1.6rem] shrink-0 ${iconClass}`}
              >
                <Icon />
              </div>
              <div>
                <span className="block text-[1.45rem] font-bold text-text-primary leading-tight">
                  {value}
                </span>
                <span className="block text-[1rem] text-text-secondary">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3.5 px-[18px] py-3 rounded-lg border border-[var(--border-subtle)] bg-bg-elevated shrink-0 w-[390px]">
          <div
            className="w-[52px] h-[52px] rounded-full bg-cover bg-center "
            style={{
              backgroundImage: `url(${userData?.picture})`
            }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-text-primary">
              {userData?.name}
            </h2>
            <p className="text-[0.85rem] text-text-muted mt-0.5 truncate">
              {userData?.email}
            </p>
            <p className="text-[0.82rem] text-accent-violet mt-0.5">
              <span className="text-text-muted font-semibold">ID : </span>
              {userData?.id}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 pl-3.5 border-l border-[var(--border-subtle)]">
            <button
              type="button"
              className="w-9 h-9 rounded-sm flex items-center justify-center text-text-muted text-[1.4rem] bg-transparent hover:bg-[var(--bg-hover)] hover:text-text-secondary"
              title="Edit profile"
            >
              <FaUserEdit />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-sm flex items-center justify-center text-text-muted text-[1.3rem] bg-transparent hover:bg-[var(--bg-hover)] hover:text-text-secondary"
              title="Notifications"
            >
              <FaBell />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
