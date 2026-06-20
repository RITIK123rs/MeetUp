import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { NullExpression } from "mongoose";

interface MessagePropr {
  id: number;
  sender: string;
  textMessage: boolean;
  text: string;
  createdAt: Date;
}

export default function Message({ chatData }: { chatData: MessagePropr[] }) {
  const userId: string | NullExpression = useSelector(
    (state: RootState) => state.user.id,
  );

  return (
    <>
      {chatData.map((data, index) => {
        return (
          <div
            key={index}
            className={`messageRow ${data.sender != userId ? "otherMessage" : "sent myMessage"} `}
          >
            {data.sender != userId && (
              <div
                className={`messageAvatar ${((index+1==chatData.length)? false : (chatData[index + 1]?.sender != userId)) && "invisible"} `}
              >
                RS
              </div>
            )}
            <div
              className={` flex flex-col gap-1.5 ${data.sender == userId ? "" : "items-end"}`}
            >
              <div
                className={`messageBubble whitespace-pre-wrap ${data.textMessage == true ? "text-[0.9rem]" : "text-[3rem]"} `}
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
