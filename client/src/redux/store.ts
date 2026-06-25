import UserReducer from "./userSlice"
import { configureStore} from "@reduxjs/toolkit"

export const store= configureStore({
    reducer: {
        user: UserReducer,
    }
});

store.subscribe(()=>{
    localStorage.setItem("user",JSON.stringify(store.getState().user));
})

export type RootState = ReturnType<typeof store.getState>;