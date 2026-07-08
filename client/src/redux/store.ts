import UserReducer from "./userSlice"
import videoChatReducer from "./videoChatSlice"
import NotificationReducer from './notificationSlice'
import { configureStore} from "@reduxjs/toolkit"

export const store= configureStore({
    reducer: {
        user: UserReducer,
        videoChat: videoChatReducer,
        notification: NotificationReducer,
    }
});

store.subscribe(()=>{
    sessionStorage.setItem("user",JSON.stringify(store.getState().user));
})

export type RootState = ReturnType<typeof store.getState>;