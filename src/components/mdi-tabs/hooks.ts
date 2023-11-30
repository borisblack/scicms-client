import _ from 'lodash'
import {getTabKey, MDIContext, MDITab} from '.'
import {useCallback, useContext, useReducer, useState} from 'react'
import mdiTabsReducer, {
    CLOSE_ACTION,
    CLOSE_ACTIVE_ACTION,
    mapInitialState,
    OPEN_ACTION,
    SET_ACTIVE_KEY,
    UPDATE_ACTION,
    UPDATE_ACTIVE_ACTION
} from './mdiTabsReducer'
import {ReactMDIContext} from './ReactMDIContext'

const mapItems = <T,>(items: MDITab<T>[]): Record<string, MDITab<T>> =>
    _.mapKeys(items, item => getTabKey(item))

/**
 * @deprecated
 */
export function useNewMDIContextReducer<T>(initialItems: MDITab<T>[]): MDIContext<T> {
    const [state, dispatch] = useReducer(mdiTabsReducer<T>, mapInitialState<T>(initialItems))
    const {activeKey, items} = state

    const setActiveKey = useCallback((key: string) => {
        dispatch({
            type: SET_ACTIVE_KEY,
            key
        })
    }, [])

    const openTab = useCallback((item: MDITab<T>) => {
        dispatch({
            type: OPEN_ACTION,
            item
        })
    }, [])

    const updateTab = useCallback((key: string, data: T) => {
        dispatch({
            type: UPDATE_ACTION,
            key,
            data
        })
    }, [])

    const updateActiveTab = useCallback((data: T) => {
        dispatch({
            type: UPDATE_ACTIVE_ACTION,
            data
        })
    }, [])

    const closeTab = useCallback((key: string, remove?: boolean) => {
        dispatch({
            type: CLOSE_ACTION,
            key,
            remove
        })
    }, [])

    const closeActiveTab = useCallback((remove?: boolean) => {
        dispatch({
            type: CLOSE_ACTIVE_ACTION,
            remove
        })
    }, [])

    return {items, activeKey, setActiveKey, openTab, updateTab, updateActiveTab, closeTab, closeActiveTab}
}

export function useNewMDIContext<T>(initialItems: MDITab<T>[]): MDIContext<T> {
    const [items, setItems] = useState<Record<string, MDITab<T>>>(mapItems(initialItems))
    const [activeKey, setActiveKey] = useState<string>()

    const openTab = useCallback((item: MDITab<T>) => {
        const key = getTabKey(item)
        const existingItem = items[key]
        if (existingItem == null) {
            setItems(prevItems => ({...prevItems, [key]: {...item}}))
        } else {
            const updatedItem: MDITab<T> = {...existingItem, onUpdate: [...existingItem.onUpdate, ...item.onUpdate]}
            setItems(prevItems => ({...prevItems, [key]: updatedItem}))
        }

        // Update active key
        if (key !== activeKey)
            setActiveKey(key)
    }, [activeKey, items])

    const updateTab = useCallback((key: string, data: T) => {
        const item = items[key]
        if (item == null)
            throw new Error('Item not found.')

        const newKey = getTabKey(item, data)

        // Reset active key
        if (key === activeKey && newKey !== key)
            setActiveKey(undefined)

        const newItems = {..._.omit(items, key), [newKey]: {...item, data: {...data}}}
        setItems(newItems)

        // Update active key
        if (key === activeKey && newKey !== key)
            setActiveKey(newKey)

        item.onUpdate.forEach(updCb => updCb(item.data))
    }, [activeKey, items])

    const updateActiveTab = useCallback((data: T) => {
        if (activeKey == null)
            return

        const item = items[activeKey]
        if (item == null)
            throw new Error('Item not found.')

        const newKey = getTabKey(item, data)

        // Reset active key
        if (newKey !== activeKey)
            setActiveKey(undefined)

        const newItems = {..._.omit(items, activeKey), [newKey]: {...item, data: {...data}}}
        setItems(newItems)

        // Update active key
        if (newKey !== activeKey)
            setActiveKey(newKey)

        item.onUpdate.forEach(updCb => updCb(item.data))
    }, [activeKey, items])

    const closeTab = useCallback((key: string, remove?: boolean) => {
        // Reset active key
        if (key === activeKey)
            setActiveKey(undefined)

        const closedItem = items[key]
        if (closedItem == null)
            throw new Error('Item not found.')

        const newItems = _.omit(items, key)
        setItems(newItems)

        // Set new active key
        const keys = Object.keys(newItems)
        if (key === activeKey && keys.length > 0)
            setActiveKey(keys[keys.length - 1])

        closedItem.onClose.forEach(closeCb => closeCb(closedItem.data, remove ?? false))
    }, [activeKey, items])

    const closeActiveTab = useCallback((remove?: boolean) => {
        if (activeKey == null)
            return

        // Reset active key
        setActiveKey(undefined)

        const closedItem = items[activeKey]
        if (closedItem == null)
            throw new Error('Item not found.')

        const newItems = _.omit(items, activeKey)
        setItems(newItems)

        // Set new active key
        const keys = Object.keys(newItems)
        if (keys.length > 0)
            setActiveKey(keys[keys.length - 1])

        closedItem.onClose.forEach(closeCb => closeCb(closedItem.data, remove ?? false))
    }, [activeKey, items])

    return {items, activeKey, setActiveKey, openTab, updateTab, updateActiveTab, closeTab, closeActiveTab}
}

export function useMDIContext<T>(): MDIContext<T> {
    const ctx = useContext(ReactMDIContext)
    if (ctx == null)
        throw new Error('MDI context is null.')

    return ctx
}
