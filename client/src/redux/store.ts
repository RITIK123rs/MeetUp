import UserReducer from "./userSlice"
import { configureStore} from "@reduxjs/toolkit"

export const store= configureStore({
    reducer: {
        user: UserReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;