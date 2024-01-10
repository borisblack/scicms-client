import React, {ReactNode} from 'react'
import {Tabs} from 'antd'
import {TabsType} from 'antd/es/tabs'
import {Tab} from 'rc-tabs/lib/interface'

import {ReactMDIContext} from './ReactMDIContext'
import styles from './MDITabs.module.css'

export interface MDITab<T> {
    key: string
    data: T
}

export interface MDIObservable<T> {
    onUpdate: ((updatedData: T) => void)[]
    onClose: ((closedData: T, remove: boolean) => void)[]
}

export interface MDITabObservable<T> extends MDITab<T>, MDIObservable<T> {}

export interface MDIContext<T> {
    items: MDITab<T>[]
    activeKey?: string
    setActiveKey: (activeKey: string) => void
    openTab: (item: MDITabObservable<T>) => void
    updateTab: (key: string, data: T, newKey?: string) => void
    updateActiveTab: (data: T, newKey?: string) => void
    closeTab: (key: string, remove?: boolean) => void
    closeActiveTab: (remove?: boolean) => void
}

interface MDITabsProps<T> {
    ctx: MDIContext<T>
    className?: string
    type?: TabsType,
    getItemLabel: (data: T) => ReactNode
    renderItem: (data: T) => ReactNode
}

export default function MDITabs<T>({ctx, className, type, getItemLabel, renderItem}: MDITabsProps<T>) {
    const {items, activeKey, setActiveKey, closeTab} = ctx

    function handleTabsEdit(e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') {
        if (action === 'remove') {
            closeTab(e as string)
        }
    }

    const getTabs = (): Tab[] => items.map(item => ({
        key: item.key,
        label: getItemLabel(item.data),
        style: {background: '#fff'},
        children: (
            <div className={styles.mdiTabContent}>
                {renderItem(item.data)}
            </div>
        )
    }))

    return (
        <ReactMDIContext.Provider value={ctx}>
            <Tabs
                items={getTabs()}
                activeKey={activeKey}
                className={className}
                hideAdd
                type={type}
                size="small"
                onChange={setActiveKey}
                onEdit={handleTabsEdit}
            />
        </ReactMDIContext.Provider>
    )
}