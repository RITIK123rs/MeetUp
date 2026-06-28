"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {setUser} from '@/redux/userSlice'

export default function ReduxInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    // console.log(savedUser);

    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, []);

  return <>{children}</>;
};
