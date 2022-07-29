import {Item} from '../../types'
import ItemService from '../../services/item'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'

export interface ItemCache {
    [name: string]: Item
}

interface RegistryState {
    loading: boolean
    items: ItemCache | null
}

const itemService = new ItemService()

const initialState: RegistryState = {
    loading: false,
    items: null
}

const fetchItemsIfNeeded = createAsyncThunk(
    'auth/fetchItemsIfNeeded',
    () => itemService.findAll(),
    {
        condition: (credentials, {getState}) => shouldFetchItems(getState() as {registry: RegistryState})
    }
)

const shouldFetchItems = (state: {registry: RegistryState}) => {
    const {loading, items} = state.registry
    return items === null && !loading
}

const registrySlice = createSlice({
    name: 'registry',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder
            .addCase(fetchItemsIfNeeded.pending, state => {
                state.loading = true
            })
            .addCase(fetchItemsIfNeeded.fulfilled, (state: RegistryState, action: PayloadAction<Item[]>) => {
                const items: ItemCache = {}
                action.payload.forEach(it => {
                    items[it.name] = it
                })
                state.items = items
                state.loading = false
            })
            .addCase(fetchItemsIfNeeded.rejected, (state, action) => {
                state.loading = false
                throw new Error(action.error.message)
            })
    }
})

export {fetchItemsIfNeeded}

export const {reset} = registrySlice.actions

export const selectLoading = (state: RootState) => state.registry.loading

export const selectItems = (state: RootState) => state.registry.items

export default registrySlice.reducer
