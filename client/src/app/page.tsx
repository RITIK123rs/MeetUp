"use client";

import { IoChatbubbles } from "react-icons/io5";
import { MdMailOutline } from "react-icons/md";
import { FaLock } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { setUser } from "@/redux/userSlice";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import "../style/loginPage.css";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import { showNotification } from "@/redux/notificationSlice";

interface LoginData {
  email: string;
  password: string;
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

// Small reusable spinner. Uses currentColor so it inherits the button's text color.
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
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

export default function LoginPage() {
  const router = useRouter();
  const Dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.user);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // Separate loading flags so the two buttons animate/disable independently
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  const isBusy = isLoggingIn || isGoogleLoggingIn;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setLoginData((preVal) => ({
      ...preVal,
      [name]: value,
    }));
  }

  async function loginAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isBusy) return;

    setIsLoggingIn(true);
    try {
      const response = await axios.get(
        `/api/auth/login?email=${loginData.email}&password=${loginData.password}`,
      );

      const userData: UserData = response.data;

      if (userData.success) {
        sessionStorage.setItem("user", JSON.stringify(userData));
        Dispatch(setUser(userData));
        // console.log("login socket.io");
        socket.disconnect();
        socket.auth = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        };
        socket.connect();
        router.push("/homePage");
        // Note: we intentionally don't reset isLoggingIn here since we're navigating away
        return;
      } else {
        // console.log("Login Failed");
        Dispatch(
          showNotification({ message: "Invalid email or password", type: "error" }),
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
      setIsLoggingIn(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoggingIn(true);
      try {
        const { data: userData } = await axios.post<UserData>(
          "/api/auth/google",
          {
            token: tokenResponse.access_token,
          },
        );

        if (userData.success) {
          sessionStorage.setItem("user", JSON.stringify(userData));
          Dispatch(setUser(userData));
          // console.log("login socket.io");
          socket.disconnect();
          socket.auth = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
          };
          socket.connect();
          router.push("/homePage");
          return;
        } else {
          Dispatch(
            showNotification({
              message: "Google sign-in failed. Please try again.",
              type: "error",
            }),
          );
        }
      } catch (err) {
        Dispatch(
          showNotification({
            message: "Google sign-in failed. Please try again.",
            type: "error",
          }),
        );
      } finally {
        setIsGoogleLoggingIn(false);
      }
    },
    onError: () => {
      setIsGoogleLoggingIn(false);
      Dispatch(
        showNotification({ message: "Google sign-in failed. Please try again.", type: "error" }),
      );
    },
  });

  function handleGoogleClick() {
    if (isBusy) return;
    setIsGoogleLoggingIn(true);
    googleLogin();
  }

  return (
    <div className="loginPage w-screen relative h-screen flex justify-center items-center">
      <span className="rightShadow absolute" />
      <span className="leftShadow absolute" />
      <div className="loginBox relative w-full max-w-[400px] mx-4 min-h-[510px] rounded-[20px]">
        <div className="blurBox absolute inset-0"></div>
        <div className="loginData relative px-8 py-2">
          <div className="logoBox w-16 h-16 flex mt-8 rounded-xl mx-auto items-center justify-center">
            <IoChatbubbles className="size-9 text-white" />
          </div>
          <h1 className="font-bold text-white text-2xl text-center mt-4">
            Meet Up
          </h1>
          <p
            className="text-center text-sm mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Sign in to start chatting
          </p>
          <form onSubmit={loginAction} className="mt-4">
            <div className="inputBox">
              <h1 className="label font-bold uppercase">Email</h1>
              <div className="input-wrap flex items-center px-3 py-2.5">
                <MdMailOutline
                  className="text-xl me-2 shrink-0"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  name="email"
                  className="border-0 outline-0 w-full text-[15px]"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  disabled={isBusy}
                />
              </div>
            </div>
            <div className="inputBox mt-4">
              <h1 className="label font-bold uppercase">Password</h1>
              <div className="input-wrap flex items-center px-3 py-2.5">
                <FaLock
                  className="me-2 text-lg shrink-0"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  name="password"
                  className="border-0 outline-0 w-full text-[15px]"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  disabled={isBusy}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="loginButton text-white text-[16px] rounded-xl font-bold w-full mt-6 py-2 flex items-center justify-center gap-2 transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                <>
                  Login <FaArrowRightLong />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isBusy}
              className="googleButton text-[15px] rounded-xl font-semibold w-full mt-3 py-2.5 flex items-center justify-center gap-2 transition-opacity duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoggingIn ? (
                <>
                  <Spinner />
                  Connecting...
                </>
              ) : (
                <>
                  <FaGoogle className="text-xl" /> Continue with Google
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}