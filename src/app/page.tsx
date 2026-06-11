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

import "../style/loginPage.css";
import { useState } from "react";

interface LoginData {
  email: string;
  password: string;
}

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

export default function LoginPage() {
  const router = useRouter();
  const Dispatch = useDispatch();

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setLoginData((preVal) => ({
      ...preVal,
      [name]: value,
    }));
  }

  function loginAction(): void {
    console.log(loginData);
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const response = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenResponse.access_token,
        }),
      });

      const userData = await response.json();

      if (userData.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
          }),
        );
        Dispatch(
          setUser({
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
          }),
        );
        router.push("/homePage");
      } else {
        console.log("Google Login Failed");
      }
    },
    onError: () => {
      console.log("Google Login Failed");
    },
  });

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
          <form action={loginAction} className="mt-4">
            <div className="inputBox">
              <h1 className="label font-semibold uppercase">Email</h1>
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
                />
              </div>
            </div>
            <div className="inputBox mt-4">
              <h1 className="label font-semibold uppercase">Password</h1>
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
                />
              </div>
            </div>
            <button
              type="submit"
              className="loginButton text-white text-[16px] rounded-xl font-bold w-full mt-6 py-2 flex items-center justify-center gap-2"
            >
              Login <FaArrowRightLong />
            </button>
            <button
              type="button"
              onClick={() => googleLogin()}
              className="googleButton text-[15px] rounded-xl font-semibold w-full mt-3 py-2.5 flex items-center justify-center gap-2"
            >
              <FaGoogle className="text-xl" /> Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
