import { createSlice, current } from "@reduxjs/toolkit";
import { addNewUser } from "./userSlice";

interface JoinUser {
  name: string;
  socketId: string;
  pic: string;
  mic: "on" | "off";
  camera: "on" | "off";
}

interface VideoChatState {
  id: string;
  socketId: string;
  name: string;
  roomName: string;
  roomId: string;
  mic: "on" | "off";
  camera: "on" | "off";
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
  mic: "off",
  camera: "off",
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
        mic: "off",
        camera: "off",
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
    addNewUser: (state, action) => {
      state.UserNo +=1;
      state.joinUser[action.payload.userId]= action.payload.user;
    },
  },
});

export const { setCreateRoomData, setJoinRoomData, addNewUser } = videoChatSlice.actions;
export default videoChatSlice.reducer;
