import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { NullExpression } from "mongoose";
import { useMemo, useState } from "react";

interface MessagePropr {
  sender: string;
  textMessage: boolean;
  text: string;
  createdAt: Date;
}

interface Users {
  name: string;
  picture: string;
  userId: string;
}

export default function Message({
  chatData,
  users,
}: {
  chatData: MessagePropr[];
  users: Users[];
}) {
  const userId: string | NullExpression = useSelector(
    (state: RootState) => state.user.id,
  );

  return (
    <>
      {chatData.map((data, index) => {
        const sender = users.find((user) => user.userId === data.sender);
        return (
          <div
            key={index}
            className={`messageRow ${data.sender != userId ? "otherMessage" : "sent myMessage"} `}
          >
            {data.sender != userId && (
              <div
                className={`messageAvatar rounded-full bg-bg-surface border border-[var(--border-subtle)] flex items-center justify-center text-text-secondary overflow-hidden shrink-0 ${(index + 1 == chatData.length ? false : chatData[index + 1]?.sender != userId) && "invisible"} `}
              >
                {sender?.picture ? (
                  <img
                    src={sender.picture}
                    alt={sender.name || "Sender"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold uppercase">
                    {sender?.name ? sender.name[0] : "?"}
                  </span>
                )}
              </div>
            )}
            <div
              className={` flex flex-col gap-1.5 ${data.sender == userId ? "" : "items-end"}`}
            >
              <div
                className={`messageBubble whitespace-pre-wrap ${data.textMessage == true ? "text-[0.9rem]" : "emojiBubble text-[3rem]"} `}
              >
                {data.text}
                <span className="messageTime">
                  {new Date(data.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
