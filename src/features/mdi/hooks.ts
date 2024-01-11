import {useCallback, useEffect} from 'react'
import {MDIContext, MDITabObservable} from 'src/components/MDITabs'
import {useAppDispatch, useAppSelector} from 'src/util/hooks'
import {
    selectActiveKey,
    selectItems,
    initItems,
    setActiveKey as doSetActiveKey,
    open,
    update,
    updateActive,
    close,
    closeActive,
    reset as doReset
} from './mdiSlice'
import {changeKey, onClose, onUpdate, register as registerCallbacks, reset as resetCallbacks} from './callbacks'

export function useNewMDIContextRedux<T>(initialItems: MDITabObservable<T>[]): MDIContext<T> {
    const dispatch = useAppDispatch()
    const items = useAppSelector(selectItems)
    const activeKey = useAppSelector(selectActiveKey)

    useEffect(() => {
        if (initialItems == null || initialItems.length === 0)
            return

        dispatch(
            initItems({
                initialItems: initialItems.map(item => ({
                    key: item.key,
                    data: item.data
                }))
            })
        )

        for (const item of initialItems) {
            registerCallbacks(item.key, item)
        }
    }, [dispatch, initialItems])

    const setActiveKey = useCallback((key: string) => {
        dispatch(doSetActiveKey({key}))
    }, [dispatch])

    const openTab = useCallback((item: MDITabObservable<T>) => {
        dispatch(
            open({
                item: {
                    key: item.key,
                    data: item.data
                }
            })
        )

        registerCallbacks(item.key, item)
    }, [dispatch])

    const updateTab = useCallback((key: string, data: T, newKey?: string) => {
        dispatch(update({key, newKey, data}))

        onUpdate(key, data)

        if (newKey != null && newKey !== key)
            changeKey(key, newKey)
    }, [dispatch])

    const updateActiveTab = useCallback((data: T, newKey?: string) => {
        if (activeKey == null)
            return

        dispatch(updateActive({newKey, data}))

        onUpdate(activeKey, data)

        if (newKey != null && newKey !== activeKey)
            changeKey(activeKey, newKey)
    }, [activeKey, dispatch])

    const closeTab = useCallback((key: string, remove?: boolean) => {
        const closedItem = items.find(existingItem => existingItem.key === key)
        if (closedItem == null)
            return

        dispatch(close({key}))

        onClose(key, closedItem.data, remove ?? false)
    }, [dispatch, items])

    const closeActiveTab = useCallback((remove?: boolean) => {
        if (activeKey == null)
            return

        const closedItem = items.find(existingItem => existingItem.key === activeKey)
        if (closedItem == null)
            return

        dispatch(closeActive({}))

        onClose(activeKey, closedItem.data, remove ?? false)
    }, [activeKey, dispatch, items])

    const reset = useCallback(() => {
        resetCallbacks()
        dispatch(doReset())
    }, [dispatch])

    return {items, activeKey, setActiveKey, openTab, updateTab, updateActiveTab, closeTab, closeActiveTab, reset}
}