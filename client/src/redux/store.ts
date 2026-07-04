import UserReducer from "./userSlice"
import videoChatReducer from "./videoChatSlice"
import { configureStore} from "@reduxjs/toolkit"

export const store= configureStore({
    reducer: {
        user: UserReducer,
        videoChat: videoChatReducer,
    }
});

store.subscribe(()=>{
    localStorage.setItem("user",JSON.stringify(store.getState().user));
})

export type RootState = ReturnType<typeof store.getState>;