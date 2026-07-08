"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForward } from "react-icons/io5";

const STARS = [
  { top: "12%", left: "15%", delay: "0.2s", size: "3px" },
  { top: "22%", left: "75%", delay: "0.8s", size: "4px" },
  { top: "68%", left: "10%", delay: "1.4s", size: "2px" },
  { top: "75%", left: "82%", delay: "2.0s", size: "3px" },
  { top: "8%", left: "48%", delay: "0.4s", size: "2px" },
  { top: "38%", left: "88%", delay: "1.0s", size: "4px" },
  { top: "85%", left: "42%", delay: "1.6s", size: "3px" },
  { top: "50%", left: "25%", delay: "0.6s", size: "3px" },
  { top: "30%", left: "35%", delay: "1.2s", size: "2px" },
  { top: "60%", left: "65%", delay: "1.8s", size: "4px" },
  { top: "90%", left: "18%", delay: "2.2s", size: "3px" },
  { top: "15%", left: "92%", delay: "0.5s", size: "2px" },
];

const TOTAL_SECONDS = 20;

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const progress = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * 100;
  const radius = 13;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative overflow-hidden bg-bg-base select-none"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="absolute w-[350px] h-[350px] md:w-[550px] md:h-[550px] rounded-full blur-[100px] md:blur-[140px] -top-20 -left-20 pointer-events-none"
        style={{ backgroundColor: "rgba(124, 58, 237, 0.12)" }}
      />
      <div
        className="absolute w-[350px] h-[350px] md:w-[550px] md:h-[550px] rounded-full blur-[100px] md:blur-[140px] -bottom-20 -right-20 pointer-events-none"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.12)" }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/40 animate-space-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}

        <div className="absolute top-[18%] left-[-5%] w-[130px] h-[1.5px] bg-gradient-to-r from-white via-white/50 to-transparent rotate-[35deg] opacity-70 animate-space-shoot" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <div className="relative mb-2 flex justify-center items-center">
          <div
            className="absolute w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full blur-[60px] md:blur-[80px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--accent-purple) 0%, var(--accent-blue) 55%, transparent 75%)",
              opacity: 0.35,
            }}
          />
          <svg
            viewBox="0 0 240 240"
            className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] pointer-events-none animate-space-orbit"
            style={{ transformOrigin: "120px 120px" }}
          >
            <ellipse
              cx="120"
              cy="120"
              rx="86"
              ry="28"
              fill="none"
              stroke="var(--accent-blue-light)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              opacity="0.35"
            />
            <circle cx="206" cy="120" r="4" fill="var(--accent-blue-light)" className="animate-pulse" />
          </svg>

          <img
            src="/404Icon.png"
            alt="404 - Lost in Deep Space"
            className="relative z-10 w-[230px] h-[230px] object-contain drop-shadow-[0_16px_40px_rgba(124,58,237,0.35)] select-none animate-space-bob"
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-2 bg-gradient-to-r from-accent-purple-light via-white to-accent-blue-light bg-clip-text text-transparent drop-shadow-sm select-none">
            404
          </h1>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 text-text-primary">
            Lost in Deep Space
          </h2>

          <p className="max-w-sm text-sm md:text-[0.95rem] leading-relaxed mb-8 px-4 text-text-secondary">
            The page you're trying to reach has drifted out of orbit or never existed in this sector. Let's get you back to safe coordinates.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/")}
            className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-[0_8px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_35px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer"
          >
            <span>Go to Login</span>
            <IoArrowForward className="text-lg transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-20 glass-panel ps-2 pe-3 py-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-white/10 flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
            <circle
              className="text-white/10"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="20"
              cy="20"
            />
            <circle
              className="text-accent-blue transition-all duration-1000 ease-linear"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="20"
              cy="20"
            />
          </svg>
          <span className="text-[10px] font-bold text-accent-blue-light">{countdown}s</span>
        </div>

        <div className="flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-text-primary">Auto-Redirecting</span>
          <span className="text-[9.5px] text-text-muted">Returning to login base</span>
        </div>
      </div>
    </div>
  );
}