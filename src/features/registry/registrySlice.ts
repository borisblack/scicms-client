import {Item} from '../../types'
import ItemService from '../../services/item'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '../../store'

interface RegistryState {
    loading: boolean
    items: {[name: string]: Item}
}

const itemService = new ItemService()

const initialState: RegistryState = {
    loading: false,
    items: {}
}

const fetchItems = createAsyncThunk(
    'registry/fetchItems',
    () => itemService.findAll()
)

const registrySlice = createSlice({
    name: 'registry',
    initialState,
    reducers: {
        reset: () => initialState
    },
    extraReducers: builder => {
        builder
            .addCase(fetchItems.pending, state => {
                state.loading = true
            })
            .addCase(fetchItems.fulfilled, (state: RegistryState, action: PayloadAction<Item[]>) => {
                action.payload.forEach(it => {
                    state.items[it.name] = it
                })
                state.loading = false
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false
                throw new Error(action.error.message)
            })
    }
})

export {fetchItems}

export const {reset} = registrySlice.actions

export const selectLoading = (state: RootState) => state.registry.loading

export const selectItems = (state: RootState) => state.registry.items

export default registrySlice.reducer
