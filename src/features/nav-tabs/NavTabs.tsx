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
import {useAppDispatch, useAppSelector, useQueryManager} from '../../util/hooks'
import {Item, ItemData} from '../../types'
import DefaultNavTab from './DefaultNavTab'
import ViewNavTab from './ViewNavTab'
import Mediator, {Callback, CallbackOperation} from '../../services/mediator'
import {allIcons} from '../../util/icons'
import styles from './NavTabs.module.css'

interface Props {
    onLogout: () => void
}

const mediator = Mediator.getInstance()

function NavTabs({onLogout}: Props) {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const navTabs = useAppSelector(selectNavTabs)
    const activeKey = useAppSelector(selectActiveKey)
    const queryManager = useQueryManager()

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
        const actualData = await queryManager.findById(item, id)
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
                            navTab={navTab}
                            onItemCreate={handleItemCreate}
                            onItemView={handleItemView}
                            onItemDelete={handleItemDelete}
                            onLogout={onLogout}
                        /> :
                        <ViewNavTab
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