export function formatConversationTime(date: Date | string ): string {
  const messageDate = new Date(date);
  const now = new Date();
  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  if (messageDate >= weekAgo) {
    return messageDate.toLocaleDateString("en-US", { weekday: "short" });
  }

  return messageDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
}
