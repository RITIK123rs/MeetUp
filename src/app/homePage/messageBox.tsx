import { LuMessageSquare } from "react-icons/lu";
import { FaSearch, FaArrowRight } from "react-icons/fa";

export default function MessageBox() {
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
        <h2 className="text-[1.55rem] font-bold text-text-primary mt-[18px]">Direct Chat</h2>
        <p className="text-[0.95rem] text-text-muted mt-1.5 leading-snug">
          Message anyone instantly with their ID
        </p>
      </div>

      <form className="mt-5 shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[var(--border-subtle)] bg-bg-elevated transition-colors focus-within:border-violet-600/40">
          <FaSearch className="text-[1.05rem] text-text-muted shrink-0" />
          <input
            type="text"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-text-primary text-[0.98rem] placeholder:text-text-muted"
            placeholder="Enter Person ID"
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
