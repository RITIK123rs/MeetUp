interface MessagePropr {
  id: number;
  sender: "me" | "them";
  textMessage: boolean;
  text: string;
  createdAt: Date;
}

export default function Message({ chatData }: { chatData: MessagePropr[] }) {
  return (
    <>
      {chatData.map((data, index) => {
        return (
          <div
            key={index}
            className={`messageRow ${data.sender == "them" ? "otherMessage" : "sent myMessage"} `}
          >
            {data.sender === "them" && <div className={`messageAvatar ${chatData[index + 1]?.sender =="them" && "invisible" } `}>RS</div>}
            <div
              className={` flex flex-col gap-1.5 ${data.sender == "them" ? "" : "items-end"}`}
            >
              <div className={`messageBubble ${data.textMessage == true ? "text-[0.9rem]" : "text-[3rem]" } `}>
                {data.text}
                <span className="messageTime">
                  {data.createdAt.toLocaleTimeString([], {
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
