import UserReducer from "./userSlice"
import { configureStore} from "@reduxjs/toolkit"

export const store= configureStore({
    reducer: {
        user: UserReducer,
    }
});