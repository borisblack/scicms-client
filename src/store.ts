import {configureStore} from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import registryReducer from './features/registry/registrySlice'
import navTabsReducer from './features/nav-tabs/navTabsSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        registry: registryReducer,
        navTabs: navTabsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch