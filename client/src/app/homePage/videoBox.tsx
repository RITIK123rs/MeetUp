"use client";

import { useEffect, useRef, useState } from "react";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { IoIosVideocam } from "react-icons/io";
import { TbHomeEdit } from "react-icons/tb";
import { MdAdd } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { videoChatSocket } from "@/lib/socket";
import { incrementVideoChatCount } from "@/redux/userSlice";
import { setCreateRoomData, setJoinRoomData } from "@/redux/videoChatSlice";
import axios from "axios";
import { showNotification } from "@/redux/notificationSlice";

interface JoinUsers {
  [userId: string]: {
    socketId: string;
    name: string | undefined;
    pic: string | undefined;
    mic: boolean;
    camera: boolean;
  };
}

const tabBase: string =
  "flex-1 px-2 py-[7px] rounded-[10px] text-[1.1rem] font-bold transition-colors duration-150";
const tabActive: string =
  "bg-[image:var(--accent-gradient)] text-white shadow-[0_2px_10px_rgba(124,58,237,0.3)]";
const tabInactive: string =
  "text-text-secondary bg-transparent hover:bg-[var(--bg-hover)] hover:text-text-primary";

// Small reusable spinner. Uses currentColor so it inherits the button's text color.
function Spinner({ size = "h-4 w-4" }: { size?: string }) {
  return (
    <svg
      className={`animate-spin ${size}`}
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

export default function VideoBox() {
  const router = useRouter();
  const Dispatch = useDispatch();
  const {
    name,
    id,
    picture: pic,
  } = useSelector((state: RootState) => state.user);
  const [switchButton, setSwitchButton] = useState<"joinRoom" | "createRoom">(
    "joinRoom",
  );
  const [generatedRoomID, setGeneratedRoomID] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  // Loading flags — one per async action, kept independent so switching tabs
  // or triggering one action doesn't visually affect the other form.
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  useEffect(() => {
    videoChatSocket.connect();
    // return () => {
    //   videoChatSocket.disconnect();
    // };
  }, []);

  async function createRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isCreating) return;
    if (generatedRoomID.trim().length <= 0) {
      Dispatch(
        showNotification({
          message: "Please generate a Room ID first",
          type: "error",
        }),
      );
      return;
    }
    if (roomName?.trim().length <= 0) {
      Dispatch(
        showNotification({
          message: "Please enter a room name",
          type: "error",
        }),
      );
      return;
    }
    console.log("Create Room");
    console.log({ name, id, pic });

    setIsCreating(true);
    try {
      const user = {
        name,
        socketId: videoChatSocket.id,
        roomId: generatedRoomID,
        pic,
        mic: true,
        camera: true,
      };
      Dispatch(
        setCreateRoomData({
          id,
          name,
          socketId: videoChatSocket.id,
          roomName,
          pic,
          roomId: generatedRoomID,
          createdBy: id,
        }),
      );
      sessionStorage.setItem(
        "activeVideoChat",
        JSON.stringify({
          roomName,
          roomId: generatedRoomID,
          createdBy: id,
        })
      );
      videoChatSocket.emit("createRoom", generatedRoomID, roomName, id, user);
      const RoomId = generatedRoomID;
      setGeneratedRoomID("");
      setRoomName("");
      await axios.get(`/api/user/${id}`);
      Dispatch(incrementVideoChatCount());
      router.push(`/videoChat/${RoomId}`);
      // Intentionally not resetting isCreating here — we're navigating away.
    } catch (err) {
      Dispatch(
        showNotification({
          message: "Couldn't create the room. Please try again.",
          type: "error",
        }),
      );
      setIsCreating(false);
    }
  }

  async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isJoining) return;
    if (roomId.trim()?.length !== 12) {
      Dispatch(
        showNotification({
          message: "Room ID must be 12 characters",
          type: "error",
        }),
      );
      return;
    }
    console.log("Join Room");

    setIsJoining(true);
    try {
      const user = {
        name,
        socketId: videoChatSocket.id,
        pic,
        roomId: roomId.trim(),
        mic: true,
        camera: true,
      };

      console.log("Promise before");
      const res = await new Promise((resolve, reject) => {
        console.log("inside Promise ");
        videoChatSocket.emit(
          "joinRoom",
          roomId.trim(),
          id,
          user,
          (
            status: boolean,
            RoomName: string = "",
            createdBy: string = "",
            joinUser: JoinUsers = {},
            UserNo: number = 0,
          ) => {
            console.log("Ack received!", RoomName, createdBy, joinUser, UserNo);
            Dispatch(
              setJoinRoomData({
                id,
                name,
                socketId: videoChatSocket.id,
                roomName: RoomName,
                roomId: roomId.trim(),
                pic,
                createdBy,
                joinUser,
                UserNo,
              }),
            );
            sessionStorage.setItem(
              "activeVideoChat",
              JSON.stringify({
                roomName: RoomName,
                roomId: roomId.trim(),
                createdBy,
              })
            );
            resolve(status);
          },
        );
      });
      console.log("Promise After ", res);
      if (!res) {
        console.log("Wrong room Id");
        Dispatch(
          showNotification({
            message: "Room not found. Check the ID and try again.",
            type: "error",
          }),
        );
        setIsJoining(false);
        return;
      }
      const RoomId = roomId;
      setRoomId("");
      await axios.get(`/api/user/${id}`);
      Dispatch(incrementVideoChatCount());
      router.push(`/videoChat/${RoomId}`);
      // Intentionally not resetting isJoining here — we're navigating away.
    } catch (err) {
      Dispatch(
        showNotification({
          message: "Couldn't join the room. Please try again.",
          type: "error",
        }),
      );
      setIsJoining(false);
    }
  }

  function generateId() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";

    for (let i = 0; i < 12; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
  }

  async function handleGenerateId() {
    if (isGeneratingId) return;
    console.log("generated RoomID Button");
    setIsGeneratingId(true);
    try {
      let check: boolean = false;
      let Id: string = "";
      while (!check) {
        Id = generateId();
        const res = await new Promise((Resolve) => {
          videoChatSocket.emit("CheckNewGenID", Id, (res: boolean) => {
            Resolve(res);
          });
        });
        if (res) check = true;
        console.log("Generated RoomID :- ", Id, check);
      }
      setGeneratedRoomID(Id);
    } catch (err) {
      Dispatch(
        showNotification({
          message: "Couldn't generate a Room ID. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setIsGeneratingId(false);
    }
  }

  return (
    <div className="video-box-bg px-7 py-[26px] rounded-xl border border-[var(--border-subtle)] flex flex-col text-text-secondary">
      <div className="flex items-center justify-between gap-3">
        <div className="w-[54px] h-[54px] rounded-md flex items-center justify-center border border-[var(--border-subtle)] bg-violet-600/12">
          <IoIosVideocam className="text-[1.85rem] text-accent-purple" />
        </div>
        <span className="text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-violet-600/12 text-accent-purple-light">
          Video / Audio
        </span>
      </div>

      <div className="shrink-0">
        <h2 className="text-[1.55rem] font-bold text-text-primary mt-[18px]">
          Video Chat
        </h2>
        <p className="text-[0.95rem] text-text-muted mt-1.5 leading-snug">
          Join or create a room for collaboration
        </p>

        <div
          className="flex gap-1.5 p-1.5 mt-4 rounded-md bg-bg-elevated border border-[var(--border-subtle)]"
          role="tablist"
          aria-label="Room options"
        >
          <button
            type="button"
            role="tab"
            aria-selected={switchButton === "joinRoom"}
            className={`${tabBase} ${switchButton === "joinRoom" ? tabActive : tabInactive}`}
            onClick={() => setSwitchButton("joinRoom")}
          >
            Join
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={switchButton === "createRoom"}
            className={`${tabBase} ${switchButton === "createRoom" ? tabActive : tabInactive}`}
            onClick={() => setSwitchButton("createRoom")}
          >
            Create Room
          </button>
        </div>
      </div>

      {switchButton === "joinRoom" ? (
        <form className="mt-4 shrink-0" onSubmit={joinRoom}>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[var(--border-subtle)] bg-bg-elevated transition-colors focus-within:border-violet-600/40">
            <FaSearch className="text-[1.05rem] text-text-muted shrink-0" />
            <input
              type="text"
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-primary text-[0.98rem] placeholder:text-text-muted disabled:opacity-60"
              placeholder="Enter Room ID"
              value={roomId as string}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isJoining}
            />
          </div>
          <button
            type="submit"
            disabled={isJoining}
            className="w-full mt-3.5 px-5 py-[13px] rounded-md text-[0.98rem] font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-br from-violet-600 to-violet-800 shadow-[0_4px_15px_rgba(99,102,241,0.3)] [&_svg]:text-[0.95rem] transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isJoining ? (
              <>
                <Spinner />
                Joining...
              </>
            ) : (
              <>
                Join Room
                <FaArrowRight />
              </>
            )}
          </button>
        </form>
      ) : (
        <form className="mt-4 shrink-0 space-y-2.5" onSubmit={createRoom}>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[var(--border-subtle)] bg-bg-elevated transition-colors focus-within:border-violet-600/40">
            <MdAdd className="text-[1.5rem] text-text-muted shrink-0" />
            <input
              type="text"
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-muted text-[0.98rem] cursor-not-allowed"
              // disabled
              readOnly
              required
              placeholder="Room ID"
              value={generatedRoomID as string}
            />
            <button
              type="button"
              disabled={isGeneratingId || isCreating}
              className="shrink-0 px-4 py-2 rounded-sm text-[0.82rem] font-bold bg-violet-600/25 text-accent-purple-light whitespace-nowrap hover:bg-violet-600/[0.38] flex items-center justify-center gap-1.5 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleGenerateId}
            >
              {isGeneratingId ? (
                <>
                  <Spinner size="h-3.5 w-3.5" />
                  Gen ID
                </>
              ) : (
                "Gen ID"
              )}
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[var(--border-subtle)] bg-bg-elevated transition-colors focus-within:border-violet-600/40">
            <TbHomeEdit className="text-[1.5rem] text-text-muted shrink-0" />
            <input
              type="text"
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-primary text-[0.98rem] placeholder:text-text-muted disabled:opacity-60"
              placeholder="Enter Room Name"
              required
              value={roomName as string}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full mt-1.5 px-5 py-[13px] rounded-md text-[0.98rem] font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-br from-violet-600 to-violet-800 shadow-[0_4px_15px_rgba(99,102,241,0.3)] [&_svg]:text-[0.95rem] transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Spinner />
                Creating...
              </>
            ) : (
              <>
                Create & Join Room
                <FaArrowRight />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}