import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {fetchItems, ItemMap} from '../../services/item'
import {fetchPermissions, PermissionMap} from '../../services/permission'
import {RootState} from '../../store'
import {Locale, UserInfo} from '../../types'
import {notification} from 'antd'
import {fetchItemTemplates, ItemTemplateMap} from '../../services/item-template'
import {CoreConfig, fetchCoreConfig} from '../../services/core-config'
import i18n from '../../i18n'
import {fetchLocales} from '../../services/locale'
import {fetchLifecycles, LifecycleMap} from '../../services/lifecycle'

interface RegistryState {
    isInitialized: boolean
    loading: boolean
    coreConfig?: CoreConfig
    itemTemplates: ItemTemplateMap
    items: ItemMap
    permissions: PermissionMap
    lifecycles: LifecycleMap
    locales: Locale[]
}

const initialState: RegistryState = {
    isInitialized: false,
    loading: false,
    itemTemplates: {},
    items: {},
    permissions: {},
    lifecycles: {},
    locales: []
}

const initializeIfNeeded = createAsyncThunk(
    'registry/initialize',
    async (me: UserInfo) => Promise.all([
        fetchCoreConfig(),
        fetchItemTemplates(),
        fetchItems(),
        fetchPermissions(me),
        fetchLifecycles(),
        fetchLocales()
    ]), {
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
            return initialState
        }
    },
    extraReducers: builder => {
        builder
            .addCase(initializeIfNeeded.pending, state => {
                state.loading = true
            })
            .addCase(initializeIfNeeded.fulfilled, (state, action: PayloadAction<any[]>) => {
                const response = action.payload
                state.coreConfig = response[0]
                state.itemTemplates = response[1]
                state.items = response[2]
                state.permissions = response[3]
                state.lifecycles = response[4]
                state.locales = response[5]

                state.isInitialized = true
                state.loading = false
            })
            .addCase(initializeIfNeeded.rejected, (state, action) => {
                state.isInitialized = false
                state.loading = false
                notification.error({
                    message: i18n.t('Initialization error') as string,
                    description: action.error.message
                })
            })
    }
})

export {initializeIfNeeded}

export const selectLoading = (state: RootState) => state.registry.loading

export const selectIsInitialized = (state: RootState) => state.registry.isInitialized

export const selectCoreConfig = (state: RootState) => state.registry.coreConfig

export const selectItemTemplates = (state: RootState) => state.registry.itemTemplates

export const selectItems = (state: RootState) => state.registry.items

export const selectPermissions = (state: RootState) => state.registry.permissions

export const selectLifecycles = (state: RootState) => state.registry.lifecycles

export const selectLocales = (state: RootState) => state.registry.locales

export const {reset} = registrySlice.actions

export default registrySlice.reducer
