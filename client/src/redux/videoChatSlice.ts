import { createSlice, current } from "@reduxjs/toolkit";
import { addNewUser } from "./userSlice";

interface JoinUser {
  name: string;
  socketId: string;
  pic: string;
  mic: boolean;
  camera: boolean;
}

interface VideoChatState {
  id: string;
  socketId: string;
  name: string;
  roomName: string;
  roomId: string;
  createdBy: string;
  UserNo: number;
  joinUser: {
    [userId: string]: JoinUser;
  };
}

const initialState: VideoChatState = {
  id: "",
  socketId: "",
  name: "",
  roomName: "",
  roomId: "",
  createdBy: "",
  UserNo: 0,
  joinUser: {},
};

const videoChatSlice = createSlice({
  name: "videoChat",
  initialState,
  reducers: {
    setCreateRoomData: (state, action) => {
      state.id = action.payload.id;
      state.socketId = action.payload.socketId;
      state.name = action.payload.name;
      state.roomName = action.payload.roomName;
      state.roomId = action.payload.roomId;
      state.createdBy = action.payload.createdBy;
      state.UserNo = 1;
      state.joinUser[action.payload.id] = {
        name: action.payload.name,
        socketId: action.payload.socketId,
        pic: action.payload.pic,
        mic: true,
        camera: true,
      };
      console.log(current(state));
    },
    setJoinRoomData: (state, action) => {
      state.id = action.payload.id;
      state.socketId = action.payload.socketId;
      state.name = action.payload.name;
      state.roomName = action.payload.roomName;
      state.roomId = action.payload.roomId;
      state.createdBy = action.payload.createdBy;
      state.joinUser = action.payload.joinUser;
      state.UserNo = action.payload.UserNo;
      console.log(current(state));
    },
    newUserAdded: (state, action) => {
      state.UserNo += 1;
      state.joinUser[action.payload.userId] = action.payload.user;
    },
    clickOnMic: (state) => {
      state.joinUser[state.id].mic = !state.joinUser[state.id].mic;
    },
    clickOnCamera: (state) => {
      state.joinUser[state.id].camera = !state.joinUser[state.id].camera;
    },
    setUserMic: (state, action) => {
      const { userId, mic } = action.payload;
      if (state.joinUser[userId]) {
        state.joinUser[userId].mic = mic;
      }
    },
    setUserCamera: (state, action) => {
      const { userId, camera } = action.payload;
      if (state.joinUser[userId]) {
        state.joinUser[userId].camera = camera;
      }
    },
  },
});

export const {
  setCreateRoomData,
  setJoinRoomData,
  newUserAdded,
  clickOnMic,
  clickOnCamera,
  setUserMic,
  setUserCamera,
} = videoChatSlice.actions;
export default videoChatSlice.reducer;
