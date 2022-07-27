import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

import {findAllByNames as findItemsByNames} from '../../services/item'
import menuConfig, {MenuItem, SubMenu} from '../../config/menu'
import {RootState} from '../../store'
import {Item} from '../../types'

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
    () => findItemsByNames(extractItemNames(menuConfig.items))
)

const extractItemNames = (menuItems: (SubMenu | MenuItem)[]): string[] => {
    const itemNames: string[] = []
    menuItems.forEach(it => {
        if ('children' in it)
            itemNames.push(...extractItemNames(it.children))
        else
            itemNames.push(it.itemName)
    })

    return itemNames
}

const slice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        reset(state) {
            const {loading, items} = initialState
            state.loading = loading
            state.items = items
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchItems.pending, state => {
                state.loading = true
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.items = action.payload
                state.loading = false
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false
                throw new Error(action.error.message)
            })
    }
})

export {fetchItems}

export const {reset} = slice.actions

export const selectLoading = (state: RootState) => state.navigation.loading

export const selectItems = (state: RootState) => state.navigation.items

export default slice.reducer
