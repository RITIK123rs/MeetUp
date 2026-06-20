import chat from "@/models/chat";

export async function addMessage(
  messageType: "new" | "existing",
  chatId: string,
  data: any,
) {
  let updatedData;
  if (messageType === "new") {
    updatedData = await chat.findByIdAndUpdate(
      chatId,
      { $push: { messageGroups : data } },
      { new: true },
    );
  } else {
    const chatDoc = await chat.findById(chatId);
    const lastIndex = chatDoc.messageGroups.length - 1;
    updatedData = await chat.findByIdAndUpdate(
      chatId,
      { $push: { [`messageGroups.${lastIndex}.chats`]: data } },
      { new: true },
    );
  }
//   console.log(updatedData);
}
