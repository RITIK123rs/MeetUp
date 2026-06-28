import { formatConversationTime } from "@/lib/formatTime";

type PersonBoxProps = {
  active?: boolean;
  name: string;
  picture: string;
  preview: string;
  isGroup: boolean;
  lastMessageAt: Date;
  unreadCount?: number;
  online?: boolean;
  onClick?: () => void;
};

export default function PersonBox({
  active = false,
  name,
  picture,
  preview,
  isGroup,
  lastMessageAt,
  unreadCount = 0,
  online = false,
  onClick,
}: PersonBoxProps) {
  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <button
      type="button"
      className={`personBox flex items-center gap-3 w-full text-left ${active ? "active" : ""} ${hasUnread ? "has-unread" : ""}`}
      onClick={onClick}
    >
      <div className="imageBox w-11 h-11 flex justify-center items-center rounded-full relative">
        <span className="w-[100%] h-[100%] rounded-full bg-cover bg-center" style={{
              backgroundImage: `url(${picture})`,
            }} />
        { !isGroup && online && (
          <span className="online-dot absolute w-2.5 h-2.5 bottom-0 right-0 rounded-full bg-green-500" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="person-name truncate">{name}</span>
        <span className="person-preview truncate">{preview}</span>
      </div>
      <div className="person-meta flex flex-col items-end shrink-0 gap-1.5">
        <span className="person-date">{formatConversationTime(lastMessageAt)}</span>
        {hasUnread && <span className="unread-badge">{displayCount}</span>}
      </div>
    </button>
  );
}
