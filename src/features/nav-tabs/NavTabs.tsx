import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {message, Tabs} from 'antd'
import {ExclamationCircleOutlined, SearchOutlined} from '@ant-design/icons'
import {Tab} from 'rc-tabs/lib/interface'

import {
    closeNavTab,
    generateKey,
    getLabel,
    openNavTab,
    selectActiveKey,
    selectNavTabs,
    setActiveKey,
    updateActiveNavTab,
    ViewType
} from './navTabsSlice'
import {useAppDispatch, useAppSelector} from '../../util/hooks'
import {Item, ItemData, Locale, UserInfo} from '../../types'
import DefaultNavTab from './DefaultNavTab'
import ViewNavTab from './ViewNavTab'
import Mediator, {Callback, CallbackOperation} from '../../services/mediator'
import {allIcons} from '../../util/icons'
import {findById} from '../../services/query'
import {ItemMap} from '../../services/item'
import {PermissionMap} from '../../services/permission'
import {CoreConfig} from '../../services/core-config'
import {ItemTemplateMap} from '../../services/item-template'
import styles from './NavTabs.module.css'

interface Props {
    me: UserInfo
    coreConfig: CoreConfig
    itemTemplates: ItemTemplateMap
    items: ItemMap
    permissions: PermissionMap
    locales: Locale[]
    onLogout: () => void
}

const mediator = Mediator.getInstance()

function NavTabs({me, coreConfig, itemTemplates, items, permissions, locales, onLogout}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const navTabs = useAppSelector(selectNavTabs)
    const activeKey = useAppSelector(selectActiveKey)

    const handleTabsChange = useCallback((activeKey: string) => {
        dispatch(setActiveKey(activeKey))
    }, [dispatch])

    const closeTab = useCallback((key: string) => {
        mediator.removeKey(key)
        dispatch(closeNavTab(key))
    }, [dispatch])

    const handleTabsEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action === 'remove')
            closeTab(e as string)
    }, [closeTab])

    const handleItemCreate = (item: Item, initialData?: ItemData | null, cb?: Callback, observerKey?: string) => {
        if (cb) {
            const key = generateKey(item.name, ViewType.view)
            observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            dispatch(openNavTab({key, item, viewType: ViewType.view, data: initialData}))
        } else {
            dispatch(openNavTab({item, viewType: ViewType.view}))
        }
    }

    const handleItemView = async (item: Item, id: string, extra?: Record<string, any>, cb?: Callback, observerKey?: string) => {
        const actualData = await findById(items, item, id)
        if (actualData.data) {
            if (cb) {
                const key = generateKey(item.name, ViewType.view, actualData.data.id)
                observerKey ? mediator.addObserver(observerKey, key, [cb]) : mediator.addObservable(key, [cb])
            }

            dispatch(openNavTab({item, viewType: ViewType.view, data: actualData.data, extra}))
        } else {
            message.error(t('Item not found. It may have been removed'))
        }
    }

    const handleItemDelete = (itemName: string, id: string) => {
        const key = generateKey(itemName, ViewType.view, id)
        mediator.runObservableCallbacks(key, CallbackOperation.DELETE, id)
        closeTab(key)
    }

    const handleUpdate = (data: ItemData) => dispatch(updateActiveNavTab(data))

    const getTabs = (): Tab[] => navTabs.map(navTab => {
        const {item, viewType} = navTab
        const Icon = (viewType === ViewType.default) ? SearchOutlined : (item.icon ? allIcons[item.icon] : null)
        const title = getLabel(navTab)
        return {
            key: navTab.key,
            label: <span>{Icon && <Icon/>}{title}{navTab.extra && <ExclamationCircleOutlined className="tab-label-suffix orange"/>}</span>,
            style: {background: '#fff'},
            children: (
                <div className={styles.pageContent}>
                    {viewType === ViewType.default ?
                        <DefaultNavTab
                            me={me}
                            itemTemplates={itemTemplates}
                            items={items}
                            permissions={permissions}
                            locales={locales}
                            navTab={navTab}
                            onItemCreate={handleItemCreate}
                            onItemView={handleItemView}
                            onItemDelete={handleItemDelete}
                            onLogout={onLogout}
                        /> :
                        <ViewNavTab
                            me={me}
                            coreConfig={coreConfig}
                            itemTemplates={itemTemplates}
                            items={items}
                            permissions={permissions}
                            locales={locales}
                            navTab={navTab}
                            closeNavTab={() => closeTab(navTab.key)}
                            onItemCreate={handleItemCreate}
                            onItemView={handleItemView}
                            onItemDelete={handleItemDelete}
                            onUpdate={handleUpdate}
                            onLogout={onLogout}
                        />
                    }
                </div>
            )
        }
    })

    if (navTabs.length === 0)
        return null

    return (
        <Tabs
            activeKey={activeKey}
            hideAdd
            type="editable-card"
            className="pages"
            items={getTabs()}
            onChange={handleTabsChange}
            onEdit={handleTabsEdit}
        />
    )
}

export default NavTabs