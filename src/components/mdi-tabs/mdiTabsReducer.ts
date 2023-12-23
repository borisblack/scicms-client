import _ from 'lodash'
import {produce} from 'immer'
import {getTabKey, MDITab} from '.'
import {Draft} from '@reduxjs/toolkit'

export interface MDITabsState<T> {
    items: Record<string, MDITab<T>>
    activeKey?: string
}

export interface MDITabsAction<T> {
    type: string
    key?: string
    item?: MDITab<T>
    data?: T
    remove?: boolean
}

export const SET_ACTIVE_KEY = 'setActiveKey'
export const OPEN_ACTION = 'open'
export const UPDATE_ACTION = 'update'
export const UPDATE_ACTIVE_ACTION = 'updateActive'
export const CLOSE_ACTION = 'close'
export const CLOSE_ACTIVE_ACTION = 'closeActive'

export const mapInitialState = <T,>(items: MDITab<T>[]): MDITabsState<T> => ({
    items: _.mapKeys(items, item => getTabKey(item))
})

export default function mdiTabsReducer<T>(draft: Draft<MDITabsState<T>>, action: MDITabsAction<T>) {
    switch (action.type) {
        case SET_ACTIVE_KEY: {
            const {key} = action
            if (key == null)
                throw new Error('Action key is null.')

            if (!draft.items.hasOwnProperty(key))
                throw new Error('Key not found.')

            draft.activeKey = key
            break
        }
        case OPEN_ACTION: {
            const {item} = action
            if (item == null)
                throw new Error('Action item is null.')

            const {items} = draft
            const key = getTabKey(item)
            const existingItem = items[key]
            items[key] = (existingItem == null ? {...item} : {...existingItem, onUpdate: [...existingItem.onUpdate, ...item.onUpdate]}) as any
            draft.activeKey = key
            break
        }
        case UPDATE_ACTION: {
            const {key, data} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = draft
            const item = items[key] as MDITab<T>
            if (item == null)
                throw new Error('Item not found.')

            const newKey = getTabKey(item, data)
            if (newKey !== key)
                delete items[key]

            items[newKey] = {...item, data: {...data} as any}
            draft.activeKey = newKey

            item.onUpdate.forEach(updCb => updCb(item.data))

            break
        }
        case UPDATE_ACTIVE_ACTION: {
            const {data} = action
            const {activeKey, items} = draft
            if (activeKey == null)
                break

            const item = items[activeKey] as MDITab<T>
            if (item == null)
                throw new Error('Item not found.')

            const newKey = getTabKey(item, data)
            if (newKey !== activeKey)
                delete items[activeKey]

            items[newKey] = {...item, data: {...data} as any}
            draft.activeKey = newKey

            item.onUpdate.forEach(updCb => updCb(item.data as T))

            break
        }
        case CLOSE_ACTION: {
            const {key, remove} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = draft
            const closedItem = items[key]
            if (closedItem == null)
                break

            delete items[key]
            const keys = Object.keys(items)
            draft.activeKey = keys.length > 0 ? keys[keys.length - 1] : undefined

            closedItem?.onClose.forEach(closeCb => closeCb(closedItem.data as T,remove ?? false))

            break
        }
        case CLOSE_ACTIVE_ACTION: {
            const {remove} = action
            const {activeKey, items} = draft
            if (activeKey == null)
                break

            const closedItem = items[activeKey]
            if (closedItem == null)
                throw new Error('Item not found.')

            delete items[activeKey]
            const keys = Object.keys(items)
            draft.activeKey = keys.length > 0 ? keys[keys.length - 1] : undefined

            closedItem.onClose.forEach(closeCb => closeCb(closedItem.data as T, remove ?? false))

            break
        }
        default: {
            throw new Error(`Unknown action: ${action.type}.`)
        }
    }
}