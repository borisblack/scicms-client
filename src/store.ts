import {configureStore} from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import registryReducer from './features/registry/registrySlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        registry: registryReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch