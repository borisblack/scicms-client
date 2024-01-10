import {MDITabObservable} from '.'
import {Draft} from '@reduxjs/toolkit'

export interface MDITabsState<T> {
    items: MDITabObservable<T>[]
    activeKey?: string
}

export interface MDITabsAction<T> {
    type: string
    key?: string
    newKey?: string
    item?: MDITabObservable<T>
    data?: T
    remove?: boolean
}

export const SET_ACTIVE_KEY = 'setActiveKey'
export const OPEN_ACTION = 'open'
export const UPDATE_ACTION = 'update'
export const UPDATE_ACTIVE_ACTION = 'updateActive'
export const CLOSE_ACTION = 'close'
export const CLOSE_ACTIVE_ACTION = 'closeActive'

export default function mdiTabsReducer<T>(draft: Draft<MDITabsState<T>>, action: MDITabsAction<T>) {
    switch (action.type) {
        case SET_ACTIVE_KEY: {
            const {key} = action
            if (key == null)
                throw new Error('Action key is null.')

            if (draft.items.findIndex(item => item.key === key) === -1)
                throw new Error('Key not found.')

            draft.activeKey = key
            break
        }
        case OPEN_ACTION: {
            const {item} = action
            if (item == null)
                throw new Error('Action item is null.')

            const {key} = item
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = draft
            const existingIndex = items.findIndex(existingItem => existingItem.key === key)
            if (existingIndex === -1) {
                items.push({...item} as any)
            } else {
                const existingItem = items[existingIndex]
                items[existingIndex] = {
                    ...existingItem,
                    onUpdate: [...existingItem.onUpdate, ...item.onUpdate],
                    onClose: [...existingItem.onClose, ...item.onClose]
                }
            }

            draft.activeKey = key
            break
        }
        case UPDATE_ACTION: {
            const {key, newKey, data} = action
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

            updatedItem.onUpdate.forEach(updCb => updCb(updatedItem.data))

            break
        }
        case UPDATE_ACTIVE_ACTION: {
            const {activeKey, items} = draft
            const {newKey, data} = action
            if (activeKey == null)
                break

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

            updatedItem.onUpdate.forEach(updCb => updCb(updatedItem.data))

            break
        }
        case CLOSE_ACTION: {
            const {key, remove} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items, activeKey} = draft
            const closedIndex = items.findIndex(existingItem => existingItem.key === key)
            if (closedIndex === -1)
                break

            const closedItem = items[closedIndex]
            items.splice(closedIndex, 1)

            if (key === activeKey)
                draft.activeKey = items.length > 0 ? items[items.length - 1].key : undefined

            closedItem?.onClose.forEach(closeCb => closeCb(closedItem.data as T,remove ?? false))

            break
        }
        case CLOSE_ACTIVE_ACTION: {
            const {remove} = action
            const {activeKey, items} = draft
            if (activeKey == null)
                break

            const closedIndex = items.findIndex(existingItem => existingItem.key === activeKey)
            if (closedIndex === -1)
                break

            const closedItem = items[closedIndex]
            items.splice(closedIndex, 1)
            draft.activeKey = items.length > 0 ? items[items.length - 1].key : undefined

            closedItem.onClose.forEach(closeCb => closeCb(closedItem.data as T, remove ?? false))

            break
        }
        default: {
            throw new Error(`Unknown action: ${action.type}.`)
        }
    }
}