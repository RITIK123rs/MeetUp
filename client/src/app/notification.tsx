"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { hideNotification } from "@/redux/notificationSlice";

type NotificationType = "success" | "error" | "info";

const typeStyles: Record<
  NotificationType,
  { icon: React.ReactNode; accent: string; glow: string }
> = {
  success: {
    icon: (
      <FaCheckCircle
        className="text-lg shrink-0"
        style={{ color: "var(--online)" }}
      />
    ),
    accent: "var(--online)",
    glow: "rgba(34,197,94,0.18)",
  },
  error: {
    icon: (
      <FaExclamationCircle
        className="text-lg shrink-0"
        style={{ color: "#f87171" }}
      />
    ),
    accent: "#f87171",
    glow: "rgba(248,113,113,0.18)",
  },
  info: {
    icon: <FaInfoCircle className="text-lg shrink-0 text-accent-blue-light" />,
    accent: "var(--accent-blue-light)",
    glow: "rgba(147,197,253,0.18)",
  },
};

export default function Notification() {
  const dispatch = useDispatch();
  const { message, type, visible } = useSelector(
    (state: RootState) => state.notification,
  );

  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }
    if (enterRef.current) {
      clearTimeout(enterRef.current);
      enterRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (visible) {
      setMounted(true);
      setClosing(true);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setClosing(false);
        });
      });

      autoHideRef.current = setTimeout(() => {
        handleClose();
      }, 6000);
    } else {
      setMounted(false);
      setClosing(false);
    }

    return () => {
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
      if (enterRef.current) clearTimeout(enterRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    setClosing(true);
    setTimeout(() => {
      dispatch(hideNotification());
    }, 250);
  };

  if (!mounted) return null;

  const { icon, accent, glow } = typeStyles[type];

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transition-all duration-300 ease-out"
      style={{
        transform: closing ? "translateX(120%)" : "translateX(0)",
        opacity: closing ? 0 : 1,
      }}
    >
      <div
        className="flex items-center gap-3 max-w-sm bg-bg-elevated border border-[var(--border-subtle)] rounded-[var(--radius-lg)] pl-4 pr-2 py-3"
        style={{
          boxShadow: `0 0 0 1px ${glow}, 0 12px 30px -10px rgba(0,0,0,0.6)`,
          border: `1px solid ${accent}`,
        }}
      >
        {icon}
        <span className="text-[14px] font-medium text-text-primary leading-snug">
          {message}
        </span>
        <button
          onClick={handleClose}
          className="ml-2 flex items-center justify-center p-1.5 rounded-full text-text-muted hover:text-text-secondary hover:bg-[var(--bg-hover)] transition-colors shrink-0"
          aria-label="Close notification"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}
