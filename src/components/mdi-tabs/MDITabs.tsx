import _ from 'lodash'
import React, {ReactNode} from 'react'
import {Tabs} from 'antd'
import {TabsType} from 'antd/es/tabs'
import {Tab} from 'rc-tabs/lib/interface'
import styles from './MDITabs.module.css'
import {getTabLabel, MDIContext, MDITab} from './index'
import {ReactMDIContext} from './ReactMDIContext'

interface MDITabsProps<T> {
    ctx: MDIContext<T>
    className?: string
    type?: TabsType,
    renderItem?: (data: T) => ReactNode
}

export default function MDITabs<T>({ctx, className, type, renderItem}: MDITabsProps<T>) {
    const {items, activeKey, setActiveKey, closeTab} = ctx

    function handleTabsEdit(e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') {
        if (action === 'remove') {
            closeTab(e as string)
        }
    }

    const getTabs = (): Tab[] => _.map(items, (item, key) => ({
        key,
        label: getTabLabel(item),
        style: {background: '#fff'},
        children: (
            <div className={styles.mdiTabContent}>
                {doRender(item)}
            </div>
        )
    }))

    /**
     * One if render functions must be specified.
     */
    function doRender(item: MDITab<T>): ReactNode {
        if (item.render == null) {
            if (renderItem == null)
                throw new Error(`No render function for MDI tab [${getTabLabel(item)}].`)

            return renderItem(item.data)
        }

        return item.render(item.data)
    }

    return (
        <ReactMDIContext.Provider value={ctx}>
            <Tabs
                items={getTabs()}
                activeKey={activeKey}
                className={className}
                hideAdd
                type={type}
                onChange={setActiveKey}
                onEdit={handleTabsEdit}
            />
        </ReactMDIContext.Provider>
    )
}