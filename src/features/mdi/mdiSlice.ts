import {createSlice, Draft, PayloadAction} from '@reduxjs/toolkit'

import {MDITab} from 'src/components/mdi-tabs'
import {RootState} from '../../store'

export interface MDIState<T> {
    items: MDITab<T>[]
    activeKey?: string
}

export interface MDIAction<T> {
    initialItems?: MDITab<T>[]
    key?: string
    newKey?: string
    item?: MDITab<T>
    data?: T
}

const initialState: MDIState<any> = {
    items: [],
    activeKey: undefined
}

const mdiSlice = createSlice({
    name: 'mdi',
    initialState,
    reducers: {
        initItems(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {initialItems} = action.payload
            if (initialItems == null || initialItems.length === 0)
                return

            draft.items = [...initialItems]
        },

        setActiveKey(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {key} = action.payload
            if (key == null)
                throw new Error('Action key is null.')

            if (draft.items.findIndex(item => item.key === key) === -1)
                throw new Error('Key not found.')

            draft.activeKey = key
        },

        open(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {item} = action.payload
            if (item == null)
                throw new Error('Action item is null.')

            const {key} = item
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = draft
            const existingIndex = items.findIndex(existingItem => existingItem.key === key)
            if (existingIndex === -1)
                items.push({...item})

            draft.activeKey = key
        },

        update(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {key, newKey, data} = action.payload
            if (key == null)
                throw new Error('Action key is null.')

            if (data == null)
                throw new Error('Action data is null.')

            const {items} = draft
            const existingIndex = items.findIndex(existingItem => existingItem.key === key)
            if (existingIndex === -1)
                throw new Error('Item not found.')

            const existingItem = items[existingIndex]
            const updatedItem = {...existingItem, key: (newKey == null ? key : newKey), data: {...data}}
            items[existingIndex] = updatedItem as any

            if (newKey != null)
                draft.activeKey = newKey
        },

        updateActive(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {activeKey, items} = draft
            const {newKey, data} = action.payload
            if (activeKey == null)
                return

            if (data == null)
                throw new Error('Action data is null.')

            const existingIndex = items.findIndex(existingItem => existingItem.key === activeKey)
            if (existingIndex === -1)
                throw new Error('Item not found.')

            const existingItem = items[existingIndex]
            const updatedItem = {...existingItem, key: (newKey == null ? activeKey : newKey), data: {...data}}
            items[existingIndex] = updatedItem as any

            if (newKey != null)
                draft.activeKey = newKey
        },

        close(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {key} = action.payload
            if (key == null)
                throw new Error('Action key is null.')

            const {items, activeKey} = draft
            const closedIndex = items.findIndex(existingItem => existingItem.key === key)
            if (closedIndex === -1)
                return

            items.splice(closedIndex, 1)

            if (key === activeKey)
                draft.activeKey = items.length > 0 ? items[items.length - 1].key : undefined
        },

        closeActive(draft: Draft<MDIState<any>>, action: PayloadAction<MDIAction<any>>) {
            const {activeKey, items} = draft
            if (activeKey == null)
                return

            const closedIndex = items.findIndex(existingItem => existingItem.key === activeKey)
            if (closedIndex === -1)
                return

            items.splice(closedIndex, 1)
            draft.activeKey = items.length > 0 ? items[items.length - 1].key : undefined
        }
    }
})

export const selectItems = (state: RootState) => state.mdi.items

export const selectActiveKey = (state: RootState) => state.mdi.activeKey

export const {
    initItems,
    setActiveKey,
    open,
    update,
    updateActive,
    close,
    closeActive
} = mdiSlice.actions

export default mdiSlice.reducer