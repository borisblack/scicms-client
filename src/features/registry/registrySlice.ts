import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import ItemService from '../../services/item'
import PermissionService from '../../services/permission'
import {RootState} from '../../store'
import {UserInfo} from '../../types'
import {message} from 'antd'
import ItemTemplateService from '../../services/item-template'
import LocaleService from '../../services/locale'
import CoreConfigService from '../../services/core-config'

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
    async (me?: UserInfo) => {
        await Promise.all([
            CoreConfigService.getInstance().initialize(),
            ItemTemplateService.getInstance().initialize(),
            ItemService.getInstance().initialize(),
            PermissionService.getInstance().initialize(me),
            LocaleService.getInstance().initialize()
        ])
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
            LocaleService.getInstance().reset()
            PermissionService.getInstance().reset()
            ItemService.getInstance().reset()
            ItemTemplateService.getInstance().reset()
            CoreConfigService.getInstance().reset()

            return initialState
        }
    },
    extraReducers: builder => {
        builder
            .addCase(initializeIfNeeded.pending, state => {
                state.loading = true
            })
            .addCase(initializeIfNeeded.fulfilled, state => {
                state.isInitialized = true
                state.loading = false
            })
            .addCase(initializeIfNeeded.rejected, (state, action) => {
                state.isInitialized = false
                state.loading = false
                message.error(action.error.message)
            })
    }
})

export {initializeIfNeeded}

export const selectLoading = (state: RootState) => state.registry.loading

export const selectIsInitialized = (state: RootState) => state.registry.isInitialized

export const {reset} = registrySlice.actions

export default registrySlice.reducer
