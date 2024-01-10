import {useCallback, useContext, useState} from 'react'
import {useImmerReducer} from 'use-immer'
import {MDIContext, MDITabObservable} from '.'
import mdiTabsReducer, {
    MDITabsAction,
    MDITabsState,
    CLOSE_ACTION,
    CLOSE_ACTIVE_ACTION,
    OPEN_ACTION,
    SET_ACTIVE_KEY,
    UPDATE_ACTION,
    UPDATE_ACTIVE_ACTION
} from './mdiTabsReducer'
import {ReactMDIContext} from './ReactMDIContext'

export function useNewMDIContextReducer<T>(initialItems: MDITabObservable<T>[]): MDIContext<T> {
    const [state, dispatch] = useImmerReducer<MDITabsState<T>, MDITabsAction<T>>(mdiTabsReducer, {items: initialItems})
    const {activeKey, items} = state

    const setActiveKey = useCallback((key: string) => {
        dispatch({type: SET_ACTIVE_KEY, key})
    }, [dispatch])

    const openTab = useCallback((item: MDITabObservable<T>) => {
        dispatch({type: OPEN_ACTION, item})
    }, [dispatch])

    const updateTab = useCallback((key: string, data: T, newKey?: string) => {
        dispatch({type: UPDATE_ACTION, key, newKey, data})
    }, [dispatch])

    const updateActiveTab = useCallback((data: T, newKey?: string) => {
        dispatch({type: UPDATE_ACTIVE_ACTION, newKey, data})
    }, [dispatch])

    const closeTab = useCallback((key: string, remove?: boolean) => {
        dispatch({type: CLOSE_ACTION, key, remove})
    }, [dispatch])

    const closeActiveTab = useCallback((remove?: boolean) => {
        dispatch({type: CLOSE_ACTIVE_ACTION, remove})
    }, [dispatch])

    return {items, activeKey, setActiveKey, openTab, updateTab, updateActiveTab, closeTab, closeActiveTab}
}

export function useNewMDIContext<T>(initialItems: MDITabObservable<T>[]): MDIContext<T> {
    const [items, setItems] = useState<MDITabObservable<T>[]>(initialItems)
    const [activeKey, setActiveKey] = useState<string>()

    const openTab = useCallback((item: MDITabObservable<T>) => {
        const {key} = item
        const existingItem = items.find(curItem => curItem.key === key)
        if (existingItem == null) {
            setItems(prevItems => [...prevItems, item])
        } else {
            const updatedItem: MDITabObservable<T> = {
                ...existingItem,
                onUpdate: [...existingItem.onUpdate, ...item.onUpdate],
                onClose: [...existingItem.onClose, ...item.onClose]
            }
            setItems(prevItems => prevItems.map(prevItem => prevItem.key === key ? updatedItem : prevItem))
        }

        // Update active key
        if (key !== activeKey)
            setActiveKey(key)
    }, [activeKey, items])

    const updateTab = useCallback((key: string, data: T, newKey?: string) => {
        const existingItem = items.find(curItem => curItem.key === key)
        if (existingItem == null)
            throw new Error('Item not found.')

        // Reset active key
        if (key === activeKey && newKey != null && newKey !== key)
            setActiveKey(undefined)

        const updatedItem = {...existingItem, key: (newKey == null ? key : newKey), data: {...data}}
        setItems(prevItems => prevItems.map(prevItem => prevItem.key === key ? updatedItem : prevItem))

        // Update active key
        if (key === activeKey && newKey != null && newKey !== key)
            setActiveKey(newKey)

        updatedItem.onUpdate.forEach(updCb => updCb(updatedItem.data))
    }, [activeKey, items])

    const updateActiveTab = useCallback((data: T, newKey?: string) => {
        if (activeKey == null)
            return

        const existingItem = items.find(curItem => curItem.key === activeKey)
        if (existingItem == null)
            throw new Error('Item not found.')

        // Reset active key
        if (newKey != null && newKey !== activeKey)
            setActiveKey(undefined)

        const updatedItem = {...existingItem, key: (newKey == null ? activeKey : newKey), data: {...data}}
        setItems(prevItems => prevItems.map(prevItem => prevItem.key === activeKey ? updatedItem : prevItem))

        // Update active key
        if (newKey != null && newKey !== activeKey)
            setActiveKey(newKey)

        existingItem.onUpdate.forEach(updCb => updCb(existingItem.data))
    }, [activeKey, items])

    const closeTab = useCallback((key: string, remove?: boolean) => {
        // Reset active key
        if (key === activeKey)
            setActiveKey(undefined)

        const closedItem = items.find(item => item.key === key)
        const newItems = items.filter(item => item.key !== key)
        setItems(newItems)

        // Set new active key
        if (key === activeKey && newItems.length > 0)
            setActiveKey(newItems[newItems.length - 1].key)

        closedItem?.onClose.forEach(closeCb => closeCb(closedItem.data, remove ?? false))
    }, [activeKey, items])

    const closeActiveTab = useCallback((remove?: boolean) => {
        if (activeKey == null)
            return

        // Reset active key
        setActiveKey(undefined)

        const closedItem = items.find(item => item.key === activeKey)
        if (closedItem == null)
            throw new Error('Item not found.')

        const newItems = items.filter(item => item.key !== activeKey)
        setItems(newItems)

        // Set new active key
        if (newItems.length > 0)
            setActiveKey(newItems[newItems.length - 1].key)

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
