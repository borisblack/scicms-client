import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

import {Item, findAllByNames as findItemsByNames} from '../../services/item'
import menuConfig from '../../config/menu'

interface NavigationState {
    loading: boolean,
    items: Item[],
}

const initialState: NavigationState = {
    loading: false,
    items: []
}

const fetchItems = createAsyncThunk(
    'navigation/fetchItems',
    () => findItemsByNames(menuConfig.items.map(it => it.name))
)

const slice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        reset: state => {
            const {loading, items} = initialState
            state.loading = loading
            state.items = items
        }
    },
    extraReducers: {
        [fetchItems.pending as any]: state => {
            state.loading = true
        },
        [fetchItems.fulfilled as any]: (state, action) => {
            state.items = action.payload
            state.loading = false
        },
        [fetchItems.rejected as any]: (state, action) => {
            state.loading = false
            throw new Error(action.error.message)
        }
    }
})

export {fetchItems}

export const {reset} = slice.actions

export const selectLoading = (state: {navigation: NavigationState}) => state.navigation.loading

export const selectItems = (state: {navigation: NavigationState}) => state.navigation.items

export default slice.reducer
