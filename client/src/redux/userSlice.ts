import { createSlice, current } from "@reduxjs/toolkit";

interface Contacts {
  name: string;
  userId: string;
  picture: string;
}

interface Chats {
  name: string[];
  UserId: string[];
  picture: string;
  preview: string;
  groupName?: string;
  isGroup: boolean;
  chatId: string;
  unreadCount: number;
  lastMessageTime: string | Date;
  onlineStatus?: boolean ;
}

interface UserState {
  id: string | null;
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
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.picture = action.payload.picture;
      state.contactNo = action.payload.contactNo;
      state.groupNo = action.payload.groupNo;
      state.videoChatNo = action.payload.videoChatNo;
      state.contacts = action.payload.contacts;
      state.chats = action.payload.chats;
    },
    updateChatList: (state, action) => {
      state.chats = action.payload.chats;
    },
    updateUnReadMessage: (state, action) => {
      const index = state.chats.findIndex(
        (chat) => chat.chatId === action.payload.chatId,
      );
      state.chats[index].preview = action.payload.message;
      state.chats[index].unreadCount += 1;
      state.chats[index].lastMessageTime = new Date().toISOString();
    },
    updateActiveChat: (state, action) => {
      const index = state.chats.findIndex(
        (chat) => chat.chatId === action.payload.chatId,
      );
      state.chats[index].preview = action.payload.message;
      state.chats[index].lastMessageTime = new Date().toISOString();
    },
    setOnlineUsersList: (state, action) => {
      const onlineUserList = action.payload;
      for (let i = 0; i < state.chats.length; i++) {
        state.chats[i].onlineStatus = onlineUserList.includes(
          state.chats[i].UserId[0],
        );
      }
    },
    setUserOnline: (state, action) => {
      const index = state.chats.findIndex(
        (chat) => chat.UserId == action.payload,
      );
      console.log(current(state));
      if(!state.chats[index].onlineStatus){
        state.chats[index].onlineStatus = true;
      }
      console.log("user online : ", action.payload);
    },
    setUserOffline: (state, action) => {
      const index = state.chats.findIndex(
        (chat) => chat.UserId == action.payload,
      );
      if(!state.chats[index].onlineStatus){
        state.chats[index].onlineStatus = false;
      }
      console.log("user offline : ", action.payload);
    },
    addNewUser: (state, action) => {
      const { addContact, addChats } = action.payload;
      state.contactNo += 1;
      state.contacts.push(addContact);

      state.chats.push({
        name: [addChats.name],
        UserId: [addChats.UserId],
        picture: addChats.picture,
        preview: addChats.preview ?? "New Contact",
        isGroup: addChats.isGroup,
        chatId: addChats.chatId,
        unreadCount: addChats.unreadCount,
        lastMessageTime: new Date(0).toISOString(),
        onlineStatus: false,
      });
      console.log(
        "Redux state Data :- ",
        current(state.chats),
        current(state.contacts),
      );
    },
    addNewGroup: (state, action) => {
      state.groupNo += 1;
      state.chats.push(action.payload);
      console.log(
        "Redux groupChat :- ",
        current(state.chats)
      );
    },
    clearUser: () => initialState,
  },
});

export const {
  setUser,
  updateChatList,
  updateUnReadMessage,
  updateActiveChat,
  setOnlineUsersList,
  setUserOnline,
  setUserOffline,
  addNewUser,
  addNewGroup,
  clearUser,
} = userSlice.actions;
export default userSlice.reducer;
