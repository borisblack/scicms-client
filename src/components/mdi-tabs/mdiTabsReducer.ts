import _ from 'lodash'
import {getTabKey, MDITab} from '.'

interface MDITabsState<T> {
    items: Record<string, MDITab<T>>
    activeKey?: string
}

interface MDITabsAction<T> {
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

/**
 * @deprecated
 */
export default function mdiTabsReducer<T>(state: MDITabsState<T>, action: MDITabsAction<T>): MDITabsState<T> {
    switch (action.type) {
        case SET_ACTIVE_KEY: {
            const {key} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = state
            if (!items.hasOwnProperty(key))
                throw new Error('Key not found.')

            return {
                items: {...items},
                activeKey: key
            }
        }
        case OPEN_ACTION: {
            const {item} = action
            if (item == null)
                throw new Error('Action item is null.')

            const {items} = state
            const key = getTabKey(item)
            const existingItem = items[key]
            let newItems: Record<string, MDITab<T>>
            if (existingItem == null) {
                newItems = {...items, [key]: {...item}}
            } else {
                const updatedItem: MDITab<T> = {...existingItem, onUpdate: [...existingItem.onUpdate, ...item.onUpdate]}
                newItems = {...items, [key]: updatedItem}
            }

            const newState: MDITabsState<T> = {
                items: newItems,
                activeKey: key
            }

            return newState
        }
        case UPDATE_ACTION: {
            const {key, data} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = state
            const item = state.items[key]
            if (item == null)
                throw new Error('Item not found.')

            const newKey = getTabKey(item, data)
            const newState: MDITabsState<T> = {
                items: {..._.omit(items, key), [newKey]: {...item, data: {...data}}},
                activeKey: newKey
            }

            item.onUpdate.forEach(updCb => updCb(item.data))

            return newState
        }
        case UPDATE_ACTIVE_ACTION: {
            const {data} = action
            const {activeKey, items} = state
            if (activeKey == null)
                return {...state}

            const item = items[activeKey]
            if (item == null)
                throw new Error('Item not found.')

            const newKey = getTabKey(item, data)
            const newState: MDITabsState<T> = {
                items: {..._.omit(items, activeKey), [newKey]: {...item, data: {...data}}},
                activeKey: newKey
            }

            item.onUpdate.forEach(updCb => updCb(item.data))

            return newState
        }
        case CLOSE_ACTION: {
            const {key, remove} = action
            if (key == null)
                throw new Error('Action key is null.')

            const {items} = state
            const closedItem = items[key]
            if (closedItem == null)
                throw new Error('Item not found.')

            const newItems = _.omit(items, key)
            const keys = Object.keys(newItems)
            const newState: MDITabsState<T> = {
                items: newItems,
                activeKey: keys.length > 0 ? keys[keys.length - 1] : undefined
            }

            closedItem.onClose.forEach(closeCb => closeCb(closedItem.data,remove ?? false))

            return newState
        }
        case CLOSE_ACTIVE_ACTION: {
            const {remove} = action
            const {activeKey, items} = state
            if (activeKey == null)
                return {...state}

            const closedItem = items[activeKey]
            if (closedItem == null)
                throw new Error('Item not found.')

            const newItems = _.omit(items, activeKey)
            const keys = Object.keys(newItems)
            const newState: MDITabsState<T> = {
                items: newItems,
                activeKey: keys.length > 0 ? keys[keys.length - 1] : undefined
            }

            closedItem.onClose.forEach(closeCb => closeCb(closedItem.data, remove ?? false))

            return newState
        }
        default: {
            throw new Error(`Unknown action: ${action.type}.`)
        }
    }
}