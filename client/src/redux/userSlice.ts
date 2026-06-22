import { createSlice } from "@reduxjs/toolkit";

interface Contacts {
  name: string;
  userId: string;
}

interface Chats {
  name: string[];
  UserId: string[];
  picture: string;
  preview: string;
  isGroup: boolean;
  chatId: string;
  unreadCount: number;
  lastMessageTime: Date;
}

interface UserState {
  id: string | null ;
  name: string | null;
  email: string | null;
  picture: string | null;
  contactNo: number;
  groupNo: number;
  videoChatNo: number;
  contacts: Contacts[];
  chats: Chats[];
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  picture: null,
  contactNo: 0,
  groupNo: 0,
  videoChatNo: 0,
  contacts: [],
  chats: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.id           = action.payload.id;
      state.name         = action.payload.name;
      state.email        = action.payload.email;
      state.picture      = action.payload.picture;
      state.contactNo    = action.payload.contactNo;
      state.groupNo      = action.payload.groupNo;
      state.videoChatNo  = action.payload.videoChatNo;
      state.contacts     = action.payload.contacts;
      state.chats        = action.payload.chats;
    },
    updateChatList: (state, action) =>{
      state.chats  = action.payload.chats;
    },
    updateUnReadMessage: (state,action)=>{
      const index = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);
      state.chats[index].preview=action.payload.message;
      state.chats[index].unreadCount+=1;
      state.chats[index].lastMessageTime=new Date();
    },
    updateActiveChat: (state,action)=>{
      const index = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);
      state.chats[index].preview=action.payload.message;
      state.chats[index].lastMessageTime=new Date();
    },
    clearUser: () => initialState,
  },
});

export const { setUser,updateChatList,updateUnReadMessage,updateActiveChat,clearUser } = userSlice.actions;
export default userSlice.reducer;
