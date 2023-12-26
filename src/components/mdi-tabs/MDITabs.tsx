import React, {ReactNode} from 'react'
import {Tabs} from 'antd'
import {TabsType} from 'antd/es/tabs'
import {Tab} from 'rc-tabs/lib/interface'
import styles from './MDITabs.module.css'
import {MDIContext} from './index'
import {ReactMDIContext} from './ReactMDIContext'

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