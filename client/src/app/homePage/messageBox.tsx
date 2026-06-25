import { LuMessageSquare } from "react-icons/lu";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { useReducer, useRef } from "react";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewUser } from "@/redux/userSlice";
import axios from "axios";
import { socket } from "@/lib/socket";

export default function MessageBox() {
  const enterID = useRef<HTMLInputElement | null>(null);
  const Dispatch = useDispatch();
  const {
    id: userId,
    name: userName,
    picture: userPicture,
    contacts: userContacts,
  } = useSelector((state: RootState) => state.user);

  async function formHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enterID.current) return;
    const enterUserId = enterID.current.value,
      userExist = userContacts.find((data) => data.userId == enterUserId);
    console.log("check user in list :- ", userExist);
    if (userId == enterUserId || userExist?.userId == enterUserId) return;
    const res = await axios.post("/api/chat/userAdd", {
      userId,
      userName,
      userPicture,
      addUserId: enterID.current.value,
    });
    console.log(res.data);
    if (res.data.success) {
      console.log(res.data.userData);
      Dispatch(addNewUser(res.data.userData));
      socket.emit("newContactAdd", {
        userId: res.data.addUserId,
        data: res.data.addedUserData,
      });
    } else {
      console.log(res.data.message);
    }
  }

  return (
    <div className="message-box-bg px-7 py-[26px] rounded-xl border border-[var(--border-subtle)] flex flex-col text-text-secondary">
      <div className="flex items-center justify-between gap-3">
        <div className="w-[54px] h-[54px] rounded-md flex items-center justify-center border border-[var(--border-subtle)] bg-blue-500/12">
          <LuMessageSquare className="text-[1.85rem] text-accent-blue" />
        </div>
        <span className="text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-blue-500/12 text-accent-blue-light">
          P2P & Groups
        </span>
      </div>

      <div className="shrink-0">
        <h2 className="text-[1.55rem] font-bold text-text-primary mt-[18px]">
          Direct Chat
        </h2>
        <p className="text-[0.95rem] text-text-muted mt-1.5 leading-snug">
          Message anyone instantly with their ID
        </p>
      </div>

      <form className="mt-5 shrink-0" onSubmit={formHandler}>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[var(--border-subtle)] bg-bg-elevated transition-colors focus-within:border-violet-600/40">
          <FaSearch className="text-[1.05rem] text-text-muted shrink-0" />
          <input
            ref={enterID}
            type="text"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-primary text-[0.98rem] placeholder:text-text-muted"
            placeholder="Enter Person ID"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full mt-3.5 px-5 py-[13px] rounded-md text-[0.98rem] font-semibold text-white flex items-center justify-center gap-2 bg-[image:var(--accent-gradient)] shadow-[0_4px_15px_rgba(99,102,241,0.3)] [&_svg]:text-[0.95rem]"
        >
          Start Direct Chat
          <FaArrowRight />
        </button>
      </form>
    </div>
  );
}
