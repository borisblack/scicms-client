import {configureStore} from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import navigationReducer from './features/navigation/navigationSlice'
import pagesReducer from './features/pages/pagesSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        navigation: navigationReducer,
        pages: pagesReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch