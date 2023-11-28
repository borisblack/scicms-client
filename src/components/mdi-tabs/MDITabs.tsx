import _ from 'lodash'
import React, {ReactNode, useCallback, useState} from 'react'
import {Tabs} from 'antd'
import {TabsType} from 'antd/es/tabs'
import {Tab} from 'rc-tabs/lib/interface'
import styles from './MDITabs.module.css'

interface MDITabsProps<T> {
    mdiContext: MDIContext<T>
    className?: string
    type?: TabsType
}

export interface MDITab<T> {
    key: string | ((data: T) => string)
    label: ReactNode | ((data: T) => ReactNode)
    data: T
    render: (data: T) => ReactNode
    onUpdate?: (updatedData: T) => void
    onClose?: () => void
}

interface MDIContext<T> {
    items: Record<string, MDITab<T>>
    activeKey?: string
    setActiveKey: (activeKey: string) => void
    openTab: (item: MDITab<T>) => void
    updateTab: (key: string, data: T) => void
    updateActiveTab: (data: T) => void
    closeTab: (key: string) => void
    closeActiveTab: () => void
}

interface MDIContextProps<T> {
    initialItems: MDITab<T>[]
}

const getKey = <T,>(item: MDITab<T>, data?: T) =>
    (typeof item.key === 'function') ? item.key(data ?? item.data) : item.key

const getLabel = (item: MDITab<any>) =>
    (typeof item.label === 'function') ? item.label(item.data) : item.label

const mapItems = <T,>(items: MDITab<T>[]): Record<string, MDITab<T>> =>
    _.mapKeys(items, item => getKey(item))

export function useMDIContext<T>({initialItems}: MDIContextProps<T>): MDIContext<T> {
    const [items, setItems] = useState<Record<string, MDITab<T>>>(mapItems(initialItems))
    const [activeKey, setActiveKey] = useState<string>()

    const openTab = useCallback((item: MDITab<T>) => {
        const key = getKey(item)
        if (!items.hasOwnProperty(key)) {
            setItems(prevItems => ({...prevItems, [key]: {...item}}))
        }

        // Update active key
        if (key !== activeKey)
            setActiveKey(key)
    }, [activeKey, items])

    const updateTab = useCallback((key: string, data: T) => {
        const item = items[key]
        const newKey = getKey(item, data)

        // Reset active key
        if (key === activeKey && newKey !== key)
            setActiveKey(undefined)

        const newItems = {..._.omit(items, key), [newKey]: {...item, data: {...data}}}
        setItems(newItems)

        // Update active key
        if (key === activeKey && newKey !== key)
            setActiveKey(newKey)

        item.onUpdate?.(item.data)
    }, [activeKey, items])

    const updateActiveTab = useCallback((data: T) => {
        if (activeKey == null)
            return

        const item = items[activeKey]
        const newKey = getKey(item, data)

        // Reset active key
        if (newKey !== activeKey)
            setActiveKey(undefined)

        const newItems = {..._.omit(items, activeKey), [newKey]: {...item, data: {...data}}}
        setItems(newItems)

        // Update active key
        if (newKey !== activeKey)
            setActiveKey(newKey)

        item.onUpdate?.(item.data)
    }, [activeKey, items])

    const closeTab = useCallback((key: string) => {
        // Reset active key
        if (key === activeKey)
            setActiveKey(undefined)

        const closedItem = items[key]
        const newItems = _.omit(items, key)
        setItems(newItems)

        // Set new active key
        const keys = Object.keys(newItems)
        if (key === activeKey && keys.length > 0)
            setActiveKey(keys[keys.length - 1])

        closedItem.onClose?.()
    }, [activeKey, items])

    const closeActiveTab = useCallback(() => {
        if (activeKey == null)
            return

        // Reset active key
        setActiveKey(undefined)

        const closedItem = items[activeKey]
        const newItems = _.omit(items, activeKey)
        setItems(newItems)

        // Set new active key
        const keys = Object.keys(newItems)
        if (keys.length > 0)
            setActiveKey(keys[keys.length - 1])

        closedItem.onClose?.()
    }, [activeKey, items])

    return {items, activeKey, setActiveKey, openTab, updateTab, updateActiveTab, closeTab, closeActiveTab}
}

export default function MDITabs<T>({mdiContext, className, type}: MDITabsProps<T>) {
    const {items, activeKey, setActiveKey, closeTab} = mdiContext


    function handleTabsEdit(e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') {
        if (action === 'remove') {
            closeTab(e as string)
        }
    }

    const getTabs = (): Tab[] => _.map(items, (item, key) => ({
        key,
        label: getLabel(item),
        style: {background: '#fff'},
        children: (
            <div className={styles.mdiTabContent}>
                {item.render(item.data)}
            </div>
        )
    }))

    return (
        <Tabs
            items={getTabs()}
            activeKey={activeKey}
            className={className}
            hideAdd
            type={type}
            onChange={setActiveKey}
            onEdit={handleTabsEdit}
        />
    )
}