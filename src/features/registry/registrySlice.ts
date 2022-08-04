import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import ItemService from '../../services/item'
import PermissionService from '../../services/permission'
import {RootState} from '../../store'

interface RegistryState {
    isInitialized: boolean
    loading: boolean
}

const initialState: RegistryState = {
    isInitialized: false,
    loading: false
}

const initializeIfNeeded = createAsyncThunk(
    'auth/initialize',
    async () => {
        await ItemService.getInstance().initialize()
        await PermissionService.getInstance().initialize()
    }, {
        condition: (credentials, {getState}) => shouldInitialize(getState() as {registry: RegistryState})
    }
)

const shouldInitialize = (state: {registry: RegistryState}) => {
    const {isInitialized, loading} = state.registry
    return !isInitialized && !loading
}

const registrySlice = createSlice({
    name: 'registry',
    initialState,
    reducers: {
        reset: () => {
            ItemService.getInstance().reset()
            PermissionService.getInstance().reset()

            return initialState
        }
    },
    extraReducers: builder => {
        builder
            .addCase(initializeIfNeeded.pending, state => {
                state.loading = true
            })
            .addCase(initializeIfNeeded.fulfilled, (state: RegistryState, action) => {
                state.isInitialized = true
                state.loading = false
            })
            .addCase(initializeIfNeeded.rejected, (state, action) => {
                state.isInitialized = false
                state.loading = false
                throw new Error(action.error.message)
            })
    }
})

export {initializeIfNeeded}

export const selectLoading = (state: RootState) => state.registry.loading

export const selectIsInitialized = (state: RootState) => state.registry.isInitialized

export const {reset} = registrySlice.actions

export default registrySlice.reducer
