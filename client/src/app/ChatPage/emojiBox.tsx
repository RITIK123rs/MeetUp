import React from "react";

export default function EmojiBox({emojiState,displayMessage}:{emojiState:boolean,displayMessage:(messageType:string,emoji:string)=>void}) {
  const emojis = [
    "😀",
    "😂",
    "🤣",
    "😊",
    "😍",
    "😘",
    "🥰",
    "😎",
    "🤔",
    "😭",
    "😡",
    "👍",
    "👎",
    "👏",
    "🙏",
    "💪",
    "🔥",
    "❤️",
    "💔",
    "💯",
    "🎉",
    "✨",
    "🚀",
    "🌟",
    "🎂",
    "☕",
    "🍕",
    "🐱",
    "🐶",
    "🌈",
  ];

  return (
    <div className={`absolute ${emojiState==true ? "block" : "hidden" }  border-t-2 border-[var(--border-subtle)] flex gap-[1.5px] flex-wrap px-3 py-1 min-h-10 w-[100%] bg-[#0c0e18] bottom-[68px] left-0 `}>
      {
        emojis.map((emoji,index)=>{
            return (<button key={index} className=" emojiButton text-[25px]" onClick={()=>
              displayMessage("emoji",emoji)
            } >{emoji}</button>)
        })
      }
    </div>
  );
}
