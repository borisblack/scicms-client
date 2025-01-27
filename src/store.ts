import {configureStore} from '@reduxjs/toolkit'

import authReducer from './features/auth/authSlice'
import registryReducer from './features/registry/registrySlice'
import mdiReducer from './features/mdi/mdiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    registry: registryReducer,
    mdi: mdiReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
