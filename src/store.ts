import {configureStore} from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import registryReducer from './features/registry/registrySlice'
import pagesReducer from './features/pages/pagesSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        registry: registryReducer,
        pages: pagesReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch