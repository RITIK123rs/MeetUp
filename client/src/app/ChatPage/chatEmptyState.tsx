import { FaRegMessage } from "react-icons/fa6";
import { IoChatbubblesOutline } from "react-icons/io5";
import { HiOutlineUserAdd } from "react-icons/hi";

type ChatEmptyStateProps = {
  variant: "no-contacts" | "no-selection";
};

export function SidebarEmptyState() {
  return (
    <div className="chat-empty-sidebar flex flex-col items-center justify-center text-center px-6 py-10 flex-1 min-h-0">
      <div className="chat-empty-icon-wrap mb-4">
        <HiOutlineUserAdd className="text-2xl text-accent-violet" />
      </div>
      <p className="text-[0.95rem] font-semibold text-text-primary">No contacts yet</p>
      <p className="text-[0.82rem] text-text-muted mt-2 leading-relaxed max-w-[220px]">
        Start a direct chat from the home page using a person&apos;s ID.
      </p>
    </div>
  );
}

export function ChatEmptyState({ variant }: ChatEmptyStateProps) {
  if (variant === "no-contacts") {
    return (
      <div className="chat-empty-main bg-[#0c0e18] flex flex-1 flex-col items-center justify-center text-center px-8" >
        <div className="chat-empty-icon-wrap chat-empty-icon-wrap--large mb-5">
          <IoChatbubblesOutline className="text-7xl text-accent-violet" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Welcome to meetUp chat</h2>
        <p className="text-[1.3rem] text-text-muted mt-2 max-w-[360px] leading-relaxed">
          You don&apos;t have any conversations yet. Go to Home and use Direct Chat to connect
          with someone using their ID.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-empty-main bg-[#0c0e18] flex flex-1 flex-col items-center justify-center text-center px-8">
      <div className="chat-empty-icon-wrap chat-empty-icon-wrap--large mb-5">
        <FaRegMessage className="text-7xl text-accent-violet" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary">Select a conversation</h2>
      <p className="text-[1.3rem] text-text-muted mt-2 max-w-[360px] leading-relaxed">
        Pick a contact from the list on the left to start messaging.
      </p>
    </div>
  );
}
