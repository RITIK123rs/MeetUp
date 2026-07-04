import chat from "@/models/chat";
import user from "@/models/user";

export async function addMessage(
  messageType: "new" | "existing",
  chatId: string,
  data: any,
  message:string
) {
  let updatedData;
  if (messageType === "new") {
    updatedData = await chat.findByIdAndUpdate(
      chatId,
      { $push: { messageGroups : data }, $set: { lastMessage: message,
        lastMessageAt: new Date() } },
      { new: true },
    );
  } else {
    const chatDoc = await chat.findById(chatId);
    const lastIndex = chatDoc.messageGroups.length - 1;
    updatedData = await chat.findByIdAndUpdate(
      chatId,
      { $push: { [`messageGroups.${lastIndex}.chats`]: data }, $set: { lastMessage: message,
        lastMessageAt: new Date() } },
      { new: true },
    );
  }
  // console.log({updatedData});
}


export async function updateUserMessage(senderId:string,userId:string,message:string,activeUser:boolean,chatId:string){
  let userData
  if(!activeUser){
    userData=await user.findOneAndUpdate({_id:userId, chats: { $elemMatch: { UserId: { $in: [senderId] }, chatId: chatId } } },{
    $set: { "chats.$.preview": message, "chats.$.lastMessageTime":new Date() }, $inc: { "chats.$.unreadCount":1 } },{new:true});
  }
  else{
    userData=await user.findOneAndUpdate({_id:userId, chats: { $elemMatch: { UserId: { $in: [senderId] }, chatId: chatId } }},{
    $set: { "chats.$.preview": message, "chats.$.lastMessageTime":new Date()}},{new:true});
  }
  
  let senderData=await user.findOneAndUpdate({_id:senderId, chats: { $elemMatch: { UserId: { $in: [userId] }, chatId: chatId } } },{
    $set: { "chats.$.preview": message, "chats.$.lastMessageTime":new Date(),}
  },{new:true})


  // console.log({senderData,userData});
  // if (!userData) {
  //   console.warn(`updateUserMessage: no chat found for user ${userId} with sender ${senderId}`);
  // }else{
  //   console.log("User Data :- ",userData.chats);
  // }
  // if (!senderData) {
  //   console.warn(`updateUserMessage: no chat found for sender ${senderId} with user ${userId}`);
  // }else{
  //   console.log("sender Data :- ",senderData.chats);
  // }
  

}
