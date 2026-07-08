import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationType = "success" | "error" | "info";

type NotificationState = {
  message: string;
  type: NotificationType;
  visible: boolean;
};

const initialState: NotificationState = {
  message: "",
  type: "info",
  visible: false,
};

const NotificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type ?? "info";
      state.visible = true;
    },
    hideNotification: (state) => {
      state.visible = false;
    },
  },
});

export const { showNotification, hideNotification } = NotificationSlice.actions;
export default NotificationSlice.reducer;
