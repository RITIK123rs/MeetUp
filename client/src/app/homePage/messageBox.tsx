import { LuMessageSquare } from "react-icons/lu";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { useReducer, useRef, useState } from "react";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { addNewUser } from "@/redux/userSlice";
import axios from "axios";
import { socket } from "@/lib/socket";
import { showNotification } from "@/redux/notificationSlice";

// Small reusable spinner. Uses currentColor so it inherits the button's text color.
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function MessageBox() {
  const enterID = useRef<HTMLInputElement | null>(null);
  const Dispatch = useDispatch();
  const {
    id: userId,
    name: userName,
    picture: userPicture,
    contacts: userContacts,
  } = useSelector((state: RootState) => state.user);

  const [isAdding, setIsAdding] = useState(false);

  async function formHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enterID.current || isAdding) return;
    const enterUserId = enterID.current.value;
    // console.log("check user in list :- ", userExist);
    if (!enterUserId) {
      Dispatch(
        showNotification({
          message: "Please enter a person ID",
          type: "error",
        }),
      );
      return;
    }

    if (userId == enterUserId) {
      Dispatch(
        showNotification({
          message: "You can't add yourself as a contact",
          type: "error",
        }),
      );
      return;
    }

    const userExist = userContacts.find((data) => data.userId == enterUserId);
    if (userExist?.userId == enterUserId) {
      Dispatch(
        showNotification({
          message: "This contact has already been added",
          type: "info",
        }),
      );
      return;
    }

    setIsAdding(true);
    try {
      const res = await axios.post("/api/chat/userAdd", {
        userId,
        userName,
        userPicture,
        addUserId: enterID.current.value,
      });
      // console.log(res.data);
      if (res.data.success) {
        // console.log(res.data.userData);
        Dispatch(addNewUser(res.data.userData));
        socket.emit("newContactAdd", {
          userId: res.data.addUserId,
          data: res.data.addedUserData,
        });
        Dispatch(
          showNotification({
            message: "Contact added successfully",
            type: "success",
          }),
        );
        if (enterID.current) enterID.current.value = "";
      } else {
        // console.log(res.data.message);
        Dispatch(
          showNotification({
            message: res.data.message || "Couldn't find that user ID",
            type: "error",
          }),
        );
      }
    } catch (err) {
      Dispatch(
        showNotification({
          message: "Something went wrong. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setIsAdding(false);
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
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-primary text-[0.98rem] placeholder:text-text-muted disabled:opacity-60"
            placeholder="Enter Person ID"
            required
            disabled={isAdding}
          />
        </div>
        <button
          type="submit"
          disabled={isAdding}
          className="w-full mt-3.5 px-5 py-[13px] rounded-md text-[0.98rem] font-semibold text-white flex items-center justify-center gap-2 bg-[image:var(--accent-gradient)] shadow-[0_4px_15px_rgba(99,102,241,0.3)] [&_svg]:text-[0.95rem] transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <>
              <Spinner />
              Adding...
            </>
          ) : (
            <>
              Start Direct Chat
              <FaArrowRight />
            </>
          )}
        </button>
      </form>
    </div>
  );
}